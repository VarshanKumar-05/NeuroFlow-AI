import os
import sys
import time
import cv2
import numpy as np

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from ultralytics import YOLO
from app.engine.state_manager import ObjectStateManager
from app.engine.analytics.counter import VehicleCounter

def run_accuracy_test():
    video_path = "d:/placements/Smart traffic/frontend/public/Dataset.mp4"
    if not os.path.exists(video_path):
        print(f"Error: {video_path} not found")
        return

    print("==================================================")
    print("STARTING MILESTONE 1 ACCURACY & STABILITY TEST")
    print(f"Video Source: {video_path}")
    print("==================================================")

    model = YOLO("yolo11n.pt")
    state_manager = ObjectStateManager()
    counter = VehicleCounter(roi_line_y_ratio=0.5)

    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    print(f"Video Info: {width}x{height} | {total_frames} frames | {fps:.1f} FPS")

    frame_idx = 0
    start_time = time.time()
    track_history = {}
    class_switches = 0
    duplicate_counts = 0
    roi_crossings = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_idx += 1
        now = time.time()

        # Run YOLO + ByteTrack
        results = model.track(frame, persist=True, tracker="bytetrack.yaml", verbose=False)[0]
        
        # Update Object State Manager
        stabilized = state_manager.update(results)

        # Build current frame tracks for counter
        current_frame_tracks = {}
        for obj in stabilized:
            t_id = obj["track_id"]
            cls_id = obj["class_id"]
            x1, y1, x2, y2 = map(int, obj["bbox"])
            cx, cy = (x1 + x2) / 2.0, (y1 + y2) / 2.0

            if t_id not in track_history:
                track_history[t_id] = []
            track_history[t_id].append((cx, cy, now))

            current_frame_tracks[t_id] = {
                'cx': cx,
                'cy': cy,
                'class_id': cls_id
            }

        prev_count = counter.total_unique_vehicles
        counter.update(width, height, track_history, current_frame_tracks)
        new_count = counter.total_unique_vehicles

        if new_count > prev_count:
            roi_crossings.append((frame_idx, new_count))

        if frame_idx % 100 == 0 or frame_idx == total_frames:
            print(f"Frame {frame_idx}/{total_frames} | Unique Tracks Created: {state_manager.max_track_id} | ROI Unique Count: {counter.total_unique_vehicles}")

    cap.release()
    elapsed = time.time() - start_time

    # Evaluate Class Stability
    for t_id, track in state_manager.tracks.items():
        if len(track.class_votes) > 1:
            class_switches += 1

    print("\n==================================================")
    print("MILESTONE 1 ACCURACY TEST RESULTS")
    print("==================================================")
    print(f"Total Video Frames Processed: {frame_idx}")
    print(f"Processing Speed: {frame_idx / elapsed:.1f} FPS (Elapsed: {elapsed:.2f}s)")
    print(f"Total Track IDs Assigned: {state_manager.max_track_id}")
    print(f"Total ROI Unique Vehicle Count: {counter.total_unique_vehicles}")
    print(f"Class Switching Events: {class_switches} (Stabilized via Majority Voting)")
    print(f"Class Distribution: {counter.get_class_distribution()}")
    print("==================================================")

if __name__ == "__main__":
    run_accuracy_test()
