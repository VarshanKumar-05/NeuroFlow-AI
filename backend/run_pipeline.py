import cv2
import time
from app.ai.pipeline import VisionPipeline

def run_pipeline(video_path, output_path):
    print(f"Loading YOLOv11 and ByteTrack...")
    pipeline = VisionPipeline()
    cap = cv2.VideoCapture(video_path)
    
    total_frames = 0
    cars = 0
    trucks = 0
    buses = 0
    motorcycles = 0
    total_conf = 0.0
    start_time = time.time()
    
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    print(f"Processing {video_path}...")
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        tracked = pipeline.detector.track(frame)
        enriched = pipeline.tracker.update(tracked)
        
        annotated = frame.copy()
        for obj in enriched:
            cls = obj['class_name']
            if cls == 'car': cars += 1
            elif cls == 'truck': trucks += 1
            elif cls == 'bus': buses += 1
            elif cls == 'motorcycle': motorcycles += 1
            
            total_conf += obj.get('confidence', 0.0)
            
            x1, y1, x2, y2 = map(int, obj['bbox'])
            label = f"{cls} #{obj['track_id']} {obj.get('confidence', 0.0):.2f}"
            cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 255), 2)
            cv2.putText(annotated, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
            
        out.write(annotated)
        total_frames += 1
        if total_frames % 10 == 0:
            print(f"Processed {total_frames} frames...")
        if total_frames >= 50:
            break
            
    cap.release()
    out.release()
    
    end_time = time.time()
    total_time = end_time - start_time
    avg_fps = total_frames / total_time if total_time > 0 else 0
    
    total_objects = cars + trucks + buses + motorcycles
    avg_conf = total_conf / total_objects if total_objects > 0 else 0
    
    print("\n--- Processing Results ---")
    print(f"Total Frames: {total_frames}")
    print(f"Cars: {cars}")
    print(f"Trucks: {trucks}")
    print(f"Buses: {buses}")
    print(f"Bikes/Motorcycles: {motorcycles}")
    print(f"Average Confidence: {avg_conf:.2f}")
    print(f"Average FPS: {avg_fps:.2f}")
    print(f"Saved annotated video to: {output_path}")

if __name__ == "__main__":
    run_pipeline('/app/Dataset.mp4', '/app/Dataset_annotated.mp4')
