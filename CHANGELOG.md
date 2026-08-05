# Changelog

All notable changes to **NeuroFlow AI** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [5.1.0] - 2026-08-05
### Added
- **First-Class Floating ANPR Overlay**: Dynamic plate preview box attached above tracked vehicle bounding boxes on video streams.
- **EasyOCR Integration**: Real-time license plate ROI crop detection and character extraction (`ANPREngine`).
- **Single-Pass OCR Cache**: Cached OCR results per ByteTrack vehicle `track_id` to eliminate redundant inference overhead.
- **Channel-Aware Stream Processing**: Isolated ANPR overlays strictly to `/vehicles` stream channel, keeping `/vision` stream clean with standard vehicle bounding boxes.
- **Enterprise Open-Source Metadata**: Complete documentation set (`README.md`, `CHANGELOG.md`, `ROADMAP.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`).

### Fixed
- Hardcoded OCR placeholders (`AP39AB1234`, `98.4%`) removed; default un-recognized plates display `Reading Plate...` with `0.0%` confidence.
- Duplicate feed card creation resolved; in-place status progression (`NEW` $\rightarrow$ `ACTIVE` $\rightarrow$ `LEFT CAMERA`).
- `Vehicles Seen` metric calculation corrected to count unique tracked vehicles seen.

---

## [5.0.0] - 2026-07-28
### Added
- Commercial ANPR Vehicle Intelligence Workstation (`/vehicles`).
- In-Memory `ANPRSessionManager` owning session state (0 PostgreSQL writes).
- Dynamic Session Summary telemetry bar and searchable vehicle history table.

---

## [4.0.0] - 2026-07-26
### Added
- Emergency Command Center (`/incidents`) for real-time incident verification, emergency broadcast overlays, and alert logging.

---

## [3.0.0] - 2026-07-25
### Added
- Traffic Analytics Module (`/analytics`) with vehicular density heatmaps, flow distribution, and class breakdown graphs.

---

## [2.0.0] - 2026-07-20
### Added
- Executive Dashboard (`/dashboard`) with dynamic system health telemetry, CPU/GPU utilization, and live active vehicle counts.

---

## [1.0.0] - 2026-07-15
### Added
- Initial Release of **NeuroFlow AI**.
- YOLOv11 vehicle object detection (Car, Bus, Truck, Motorcycle).
- ByteTrack multi-object tracking integration.
- FastMJPEG video stream endpoint via FastAPI.
