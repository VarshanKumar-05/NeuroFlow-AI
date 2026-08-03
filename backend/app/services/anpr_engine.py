import cv2
import re
import numpy as np
import threading
import logging
from typing import Tuple, Optional, List

class ANPREngine:
    """
    Dedicated License Plate Detector & Asynchronous OCR Engine.
    Detects rectangular number plate ROI, crops plate region, and runs non-blocking EasyOCR / OpenCV recognition.
    """
    def __init__(self):
        self.easyocr_reader = None
        self.is_ocr_loading = False
        # Lazy background init for EasyOCR
        threading.Thread(target=self._async_init_ocr, daemon=True).start()

    def _async_init_ocr(self):
        try:
            self.is_ocr_loading = True
            import easyocr
            logging.info("[ANPREngine] Initializing EasyOCR Reader (English)...")
            self.easyocr_reader = easyocr.Reader(['en'], gpu=False, verbose=False)
            logging.info("[ANPREngine] EasyOCR Reader ready.")
        except Exception as e:
            logging.warning(f"[ANPREngine] EasyOCR background init notice: {e}")
        finally:
            self.is_ocr_loading = False

    def detect_plate_roi(self, frame: np.ndarray, bbox: List[int]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Crops exact License Plate ROI from vehicle bounding box using morphological contour analysis.
        Returns (vehicle_crop, plate_roi_crop).
        """
        x1, y1, x2, y2 = map(int, bbox)
        h, w = frame.shape[:2]
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)

        if x2 <= x1 or y2 <= y1:
            dummy = np.zeros((50, 150, 3), dtype=np.uint8)
            return dummy, dummy

        veh_crop = frame[y1:y2, x1:x2]
        vh, vw = veh_crop.shape[:2]

        # Extract lower vehicle region (where plates are mounted: 40% to 90% vertical height)
        roi_y1 = int(vh * 0.40)
        roi_y2 = min(vh, int(vh * 0.95))
        lower_roi = veh_crop[roi_y1:roi_y2, :]

        if lower_roi.size == 0 or lower_roi.shape[0] < 10 or lower_roi.shape[1] < 10:
            return veh_crop, veh_crop

        # Convert to Grayscale & apply bilateral filter to remove noise
        gray = cv2.cvtColor(lower_roi, cv2.COLOR_BGR2GRAY)
        blur = cv2.bilateralFilter(gray, 11, 17, 17)

        # Sobel Horizontal Gradient to detect vertical character edges
        sobelx = cv2.Sobel(blur, cv2.CV_8U, 1, 0, ksize=3)
        _, thresh = cv2.threshold(sobelx, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Morphological Closing to connect characters into a single plate rectangle
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (17, 3))
        closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

        # Find contours
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        plate_crop = lower_roi

        best_rect = None
        max_score = 0

        for cnt in contours:
            x, y, w_c, h_c = cv2.boundingRect(cnt)
            if h_c == 0 or w_c == 0:
                continue
            aspect_ratio = w_c / float(h_c)
            area = w_c * h_c

            # License plates typically have aspect ratio between 1.8 and 6.5
            if 1.8 <= aspect_ratio <= 6.5 and area > 150:
                score = area * aspect_ratio
                if score > max_score:
                    max_score = score
                    best_rect = (x, y, w_c, h_c)

        if best_rect:
            bx, by, bw, bh = best_rect
            pad_x = int(bw * 0.05)
            pad_y = int(bh * 0.10)
            px1 = max(0, bx - pad_x)
            py1 = max(0, by - pad_y)
            px2 = min(lower_roi.shape[1], bx + bw + pad_x)
            py2 = min(lower_roi.shape[0], by + bh + pad_y)
            plate_crop = lower_roi[py1:py2, px1:px2]

        return veh_crop, plate_crop

    def perform_ocr(self, plate_crop: np.ndarray) -> Tuple[str, float]:
        """
        Runs EasyOCR on cropped license plate region and validates alphanumerics.
        Returns (plate_text, confidence).
        """
        if plate_crop is None or plate_crop.size == 0 or plate_crop.shape[0] < 10 or plate_crop.shape[1] < 10:
            return "Reading Plate...", 0.0

        if self.easyocr_reader is not None:
            try:
                rgb_crop = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2RGB)
                results = self.easyocr_reader.readtext(rgb_crop)
                
                best_text = ""
                best_conf = 0.0

                for _, text, prob in results:
                    clean = re.sub(r'[^A-Z0-9]', '', text.upper())
                    if len(clean) >= 4 and prob > best_conf:
                        best_text = clean
                        best_conf = float(prob) * 100.0

                if best_text and best_conf >= 55.0:
                    validated = self._normalize_plate(best_text)
                    return validated, round(best_conf, 1)
            except Exception as e:
                logging.error(f"[ANPREngine] EasyOCR error: {e}")

        return "Reading Plate...", 0.0

    def _normalize_plate(self, text: str) -> str:
        clean = re.sub(r'[^A-Z0-9]', '', text.upper())
        if len(clean) >= 8:
            prefix = clean[:2].replace('0', 'O').replace('1', 'I')
            suffix = clean[-4:].replace('O', '0').replace('1', '1').replace('Z', '2')
            middle = clean[2:-4]
            return f"{prefix}{middle}{suffix}"
        return clean

# Singleton ANPREngine
anpr_engine = ANPREngine()
