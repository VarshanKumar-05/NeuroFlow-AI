# 📜 NeuroFlow AI — Project Changelog

All notable changes, feature releases, and optimizations for **NeuroFlow AI** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v5.2.0] - 2026-08-05
### Added
- **Dedicated ANPR Engine (`ANPREngine`)**: Morphological contour detection, Bilateral contrast filtering, and Sobel edge detection for precise license plate ROI cropping.
- **Asynchronous EasyOCR Integration**: Non-blocking neural OCR text extraction with character normalization (`0` $\leftrightarrow$ `O`, `1` $\leftrightarrow$ `I`).
- **Single-Pass OCR Cache**: Prevents duplicate inference by caching OCR text per ByteTrack vehicle `track_id`.
- **Channel-Aware MJPEG Video Streaming**: Strict visual module isolation keeping `/vision` streams clean with standard vehicle bounding boxes and isolating floating plate previews strictly to `/vehicles`.

### Fixed
- Removed hardcoded placeholder strings (`AP39AB1234`, `98.4%`); un-recognized plates display `Reading Plate...` with `0.0%` confidence.
- Fixed duplicate detection feed card generation; status updates in-place (`NEW` $\rightarrow$ `ACTIVE` $\rightarrow$ `LEFT CAMERA`).
- Untracked large video binaries from Git history while keeping physical disk files intact for local application execution.

---

## [v5.1.0] - 2026-08-05
### Added
- **Floating Attached ANPR Overlay**: Dynamic plate preview box attached above tracked vehicle bounding boxes on video streams.
- **Enterprise Documentation Suite**: Created `README.md`, `ROADMAP.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and `.env.example`.

---

## [v5.0.0] - 2026-07-28
### Added
- Commercial ANPR Vehicle Intelligence Workstation UI (`/vehicles`).
- In-Memory `ANPRSessionManager` owning session state with zero database write overhead.
- Dynamic Session Summary telemetry bar and searchable vehicle history table.

---

## [v4.0.0] - 2026-07-26
### Added
- Emergency Command Center (`/incidents`) for real-time incident verification, emergency overlay banners, and incident logging.

---

## [v3.0.0] - 2026-07-25
### Added
- Traffic Analytics Module (`/analytics`) with vehicular density heatmaps, flow distribution, and class breakdown graphs.

---

## [v2.0.0] - 2026-07-20
### Added
- Executive Dashboard (`/dashboard`) with dynamic system health telemetry, CPU/GPU utilization, and live active vehicle counts.

---

## [v1.0.0] - 2026-07-15
### Added
- Initial Release of **NeuroFlow AI**.
- YOLOv11 vehicle object detection (Car, Bus, Truck, Motorcycle).
- ByteTrack multi-object tracking integration.
- FastMJPEG video stream endpoint via FastAPI.
