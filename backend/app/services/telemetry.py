import asyncio
import json
import logging
from app.core.websocket_manager import manager
from app.engine.frame_manager import frame_manager

# The Telemetry Service replaces the old data_simulator.
# It acts as a multiplexer, sending real analytics from the DetectionEngine to the WebSocket clients.

_last_sent_state = {}

def _has_significant_change(key, new_data, threshold=0.01):
    old_data = _last_sent_state.get(key)
    if old_data is None:
        return True
        
    # Compare string representations to quickly check exact equality for nested dicts
    if json.dumps(old_data, sort_keys=True) == json.dumps(new_data, sort_keys=True):
        return False
        
    return True

async def broadcast_telemetry(channel: str = "dashboard"):
    """
    Acts as the TelemetryBroadcaster, pushing central metrics to the frontend.
    """
    while True:
        try:
            await asyncio.sleep(1.0) # Check every 1 second
            
            cam_status = frame_manager.get_status()
            is_online = cam_status.get("connected", False)
            
            from app.engine.core import detection_engine
            metrics = detection_engine.latest_metrics if is_online else {}
            
            # --- 1. Camera Status Update ---
            cam_payload = [{ 
                "id": cam_status.get("name", "cam-1"), 
                "name": cam_status.get("name", "Unknown"), 
                "fps": metrics.get("inference_fps", 0), 
                "latency": 1000 // max(1, metrics.get("streaming_fps", 30)), 
                "vehicles": metrics.get("vehicle_count", 0), 
                "status": 'online' if is_online else 'offline',
                "thumb": cam_status.get("url", ""),
                "type": cam_status.get("type", ""),
                "resolution": cam_status.get("resolution", ""),
                "channel": channel
            }]
            if _has_significant_change("camera_status", cam_payload):
                _last_sent_state["camera_status"] = cam_payload
                msg = {"type": "CAMERA_STATUS_UPDATE", "channel": channel, "payload": cam_payload}
                logging.info(f"[TELEMETRY_BROADCAST] {msg['type']} -> {cam_payload}")
                await manager.broadcast(msg)

            if channel == "dashboard" and is_online and metrics:
                # --- 2. Traffic Stats Update ---
                stats_payload = {
                    "totalVehicles": metrics.get("total_vehicles", 0),
                    "activeVehicles": metrics.get("active_vehicles", 0),
                    "vehiclesToday": metrics.get("vehicles_today", 0),
                    "roiCrossingCount": metrics.get("total_vehicles", 0),
                    "vpm": metrics.get("vpm", 0),
                    "vph": metrics.get("vph", 0),
                    "totalVehiclesTrend": 12.5,
                    "avgSpeed": metrics.get("avg_speed", 0),
                    "avgSpeedTrend": 2.1,
                    "congestionScore": metrics.get("congestion_score", 0),
                    "congestionLevel": metrics.get("congestion_level", "Free Flow"),
                    "trafficDensity": metrics.get("traffic_density", "0 veh/km"),
                    "roadOccupancy": metrics.get("road_occupancy", "0.0%"),
                    "queueLength": metrics.get("queue_length", "0 veh"),
                    "laneCounts": metrics.get("lane_counts", [0, 0, 0]),
                    "classCounts": metrics.get("class_counts", {}),
                    "processingFps": metrics.get("inference_fps", 0),
                    "detectionFps": metrics.get("detection_fps", 0),
                    "streamingFps": metrics.get("streaming_fps", 0),
                    "trackerFps": metrics.get("tracker_fps", 0),
                    "avgConfidence": metrics.get("avg_confidence", "0.0%"),
                    "modelName": metrics.get("model_name", "YOLOv11n"),
                    "trackerName": metrics.get("tracker_name", "ByteTrack"),
                    "inferenceResolution": metrics.get("inference_resolution", "1280x720"),
                    "trackerHealth": metrics.get("tracker_health", "Active"),
                    "cpuUsage": metrics.get("cpu_usage", "0.0%"),
                    "gpuUsage": metrics.get("gpu_usage", "0.0%"),
                    "memoryUsage": metrics.get("memory_usage", "0.0%"),
                    "latency": metrics.get("latency", "0 ms"),
                    "processingLatency": metrics.get("processing_latency", "0 ms"),
                    "congestionTrend": -5.4,
                    "activeIncidents": metrics.get("stopped_vehicles", 0)
                }
                if _has_significant_change("traffic_stats", stats_payload):
                    _last_sent_state["traffic_stats"] = stats_payload
                    msg = {"type": "TRAFFIC_STATS_UPDATE", "channel": channel, "payload": stats_payload}
                    logging.info(f"[TELEMETRY_BROADCAST] {msg['type']} -> {stats_payload}")
                    await manager.broadcast(msg)

                # --- 3. Vehicle Distribution ---
                dist_payload = metrics.get("class_distribution", [])
                if _has_significant_change("vehicle_distribution", dist_payload):
                    _last_sent_state["vehicle_distribution"] = dist_payload
                    msg = {"type": "VEHICLE_DISTRIBUTION_UPDATE", "channel": channel, "payload": dist_payload}
                    logging.info(f"[TELEMETRY_BROADCAST] {msg['type']} -> {dist_payload}")
                    await manager.broadcast(msg)

                # --- 4. System Health ---
                health_payload = metrics.get("system_health", [])
                if _has_significant_change("system_health", health_payload):
                    _last_sent_state["system_health"] = health_payload
                    msg = {"type": "SYSTEM_HEALTH_UPDATE", "channel": channel, "payload": health_payload}
                    logging.info(f"[TELEMETRY_BROADCAST] {msg['type']} -> {health_payload}")
                    await manager.broadcast(msg)

                # --- 5. Hardware Metrics ---
                hardware_payload = metrics.get("hardware", {})
                if _has_significant_change("hardware", hardware_payload):
                    _last_sent_state["hardware"] = hardware_payload
                    msg = {"type": "HARDWARE_METRICS_UPDATE", "channel": channel, "payload": hardware_payload}
                    await manager.broadcast(msg)

                # --- 6. Live Events Timeline ---
                events_payload = metrics.get("events", [])
                if _has_significant_change("events", events_payload):
                    _last_sent_state["events"] = events_payload
                    msg = {"type": "EVENTS_TIMELINE_UPDATE", "channel": channel, "payload": events_payload}
                    await manager.broadcast(msg)

                # --- 7. AI Status & Predictions ---
                pred_payload = metrics.get("predictions")
                if _has_significant_change("predictions", pred_payload):
                    _last_sent_state["predictions"] = pred_payload
                    msg = {"type": "AI_PREDICTION_UPDATE", "channel": channel, "payload": pred_payload}
                    await manager.broadcast(msg)

                ai_status_payload = metrics.get("ai_status", [])
                if _has_significant_change("ai_status", ai_status_payload):
                    _last_sent_state["ai_status"] = ai_status_payload
                    msg = {"type": "AI_STATUS_UPDATE", "channel": channel, "payload": ai_status_payload}
                    await manager.broadcast(msg)

                # --- 8. Recommendations & Incidents ---
                recs_payload = metrics.get("recommendations", [])
                if _has_significant_change("recommendations", recs_payload):
                    _last_sent_state["recommendations"] = recs_payload
                    msg = {"type": "AI_RECOMMENDATIONS_UPDATE", "channel": channel, "payload": recs_payload}
                    await manager.broadcast(msg)

                incidents_payload = metrics.get("incidents", [])
                if _has_significant_change("incidents", incidents_payload):
                    _last_sent_state["incidents"] = incidents_payload
                    msg = {"type": "INCIDENTS_SYNC", "channel": channel, "payload": incidents_payload}
                    await manager.broadcast(msg)

        except Exception as e:
            print(f"Telemetry broadcast error: {e}")
            await asyncio.sleep(2)

