import os
import shutil
import cv2
import tempfile
import logging
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from app.engine.frame_manager import frame_manager
from app.engine.core import detection_engine

router = APIRouter(prefix="/vision", tags=["vision"])

class SourceConfig(BaseModel):
    type: str
    url: str
    name: str = "Unknown Camera"
    id: str = "cam-1"

@router.get("/stream")
async def video_stream(channel: str = "dashboard"):
    """
    On-Demand streaming endpoint.
    Streams from the unified singleton DetectionEngine.
    The 'channel' parameter is kept for API compatibility, 
    but all channels now share the same pipeline.
    """
    return StreamingResponse(
        detection_engine.stream_video(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@router.post("/source")
async def set_video_source(config: SourceConfig, channel: str = "dashboard"):
    # Handle the built-in demo dataset
    if config.type in ["dataset", "demo"] or "Dataset.mp4" in config.url:
        BASE_DIR = Path(__file__).resolve().parent.parent.parent
        VIDEO_PATH = BASE_DIR / "Dataset.mp4"
        if not VIDEO_PATH.exists():
            VIDEO_PATH = Path("/app/Dataset.mp4")
            
        if not VIDEO_PATH.exists() or not os.access(VIDEO_PATH, os.R_OK):
            return {"status": "error", "message": f"Demo video file not found at {VIDEO_PATH}"}
            
        config.url = str(VIDEO_PATH)
        config.type = "mp4"
        config.name = "Built-in Demo Video"

    # Handle the special accident demo dataset
    elif config.type == "accident_demo":
        BASE_DIR = Path(__file__).resolve().parent.parent.parent
        VIDEO_PATH = BASE_DIR / "datasets" / "accident" / "Dataset_annotated.mp4"
        if not VIDEO_PATH.exists():
            VIDEO_PATH = Path("/app/Dataset_annotated.mp4")
        
        if not VIDEO_PATH.exists() or not os.access(VIDEO_PATH, os.R_OK):
            return {"status": "error", "message": "Accident dataset file not found"}
            
        cap = cv2.VideoCapture(str(VIDEO_PATH))
        if not cap.isOpened():
            return {"status": "error", "message": "Cannot open video"}
            
        success, frame = cap.read()
        cap.release()
        
        if not success or frame is None:
            return {"status": "error", "message": "Unable to decode accident dataset."}
            
        config.url = str(VIDEO_PATH)
        config.name = "Accident Demo Dataset"
        
    try:
        success = frame_manager.set_source(config.dict())
    except Exception as e:
        logging.error(f"Streaming error traceback: {e}")
        return {"status": "error", "message": "Streaming error"}
        
    if not success:
        return {"status": "error", "message": "Failed to connect to source."}
    
    return {"status": "success", "message": f"Connected to {config.name}"}

@router.get("/source/status")
async def get_video_source_status(channel: str = "dashboard"):
    return frame_manager.get_status()

@router.post("/source/reconnect")
async def reconnect_video_source(channel: str = "dashboard"):
    # Reconnect using the same config
    current_status = frame_manager.get_status()
    if current_status.get("url"):
        success = frame_manager.set_source({
            "type": current_status.get("type"),
            "url": current_status.get("url"),
            "name": current_status.get("name"),
            "id": current_status.get("id", "cam-1")
        })
        if not success:
            return {"status": "error", "message": "Reconnection failed."}
        return {"status": "success", "message": "Reconnected successfully."}
    return {"status": "error", "message": "No active source to reconnect."}

def save_upload_file(file, path):
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file, buffer)

@router.post("/upload")
async def upload_video(file: UploadFile = File(...), channel: str = "dashboard"):
    upload_dir = os.path.join(tempfile.gettempdir(), "neuroflow_uploads")
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    
    await run_in_threadpool(save_upload_file, file.file, file_path)
    
    if not os.path.exists(file_path):
        return {"status": "error", "message": f"File failed to save at {file_path}"}
        
    success = frame_manager.set_source({
        "type": "mp4",
        "url": file_path,
        "name": file.filename,
        "id": "upload-1"
    })
    
    if not success:
        return {"status": "error", "message": f"Failed to open video file {file_path}"}
    
    return {
        "status": "success",
        "message": "Video uploaded successfully",
        "file_path": file_path,
        "stream_url": f"/api/v1/vision/stream?channel={channel}"
    }

@router.get("/webcams")
async def get_webcams():
    available_cams = []
    import glob
    devices = glob.glob('/dev/video*')
    
    if devices:
        for idx, dev in enumerate(sorted(devices)):
            available_cams.append({
                "id": dev.replace('/dev/video', ''),
                "name": f"USB Webcam {idx} ({dev})"
            })
    else:
        for i in range(4):
            cap = cv2.VideoCapture(i)
            if cap.isOpened():
                available_cams.append({
                    "id": str(i),
                    "name": f"Webcam Device {i}"
                })
                cap.release()
                
    return available_cams

