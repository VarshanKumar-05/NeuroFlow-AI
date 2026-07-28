import io
import csv
import datetime
from typing import List, Dict, Any

class ExportService:
    """
    Generates CSV, Excel, and PDF reports for Vehicle Intelligence Center records.
    """
    @staticmethod
    def generate_csv(vehicles: List[Dict[str, Any]]) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            "Track ID", "Vehicle Type", "License Plate", "Canonical Plate", 
            "Raw OCR", "OCR Confidence %", "Camera", "Direction", 
            "First Seen", "Last Seen", "Status"
        ])
        
        for v in vehicles:
            writer.writerow([
                v.get("track_id", ""),
                v.get("vehicle_type", ""),
                v.get("license_plate", ""),
                v.get("canonical_plate", ""),
                v.get("raw_ocr", ""),
                v.get("ocr_confidence", 0.0),
                v.get("camera_id", ""),
                v.get("direction", ""),
                v.get("first_seen", ""),
                v.get("last_seen", ""),
                v.get("status", "")
            ])
            
        return output.getvalue()

    @staticmethod
    def generate_excel(vehicles: List[Dict[str, Any]]) -> bytes:
        """Generates formatted Excel workbook bytes (or fallback CSV buffer if openpyxl not present)."""
        try:
            import openpyxl
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = "Vehicle Intelligence Records"
            
            headers = [
                "Track ID", "Vehicle Type", "License Plate", "Canonical Plate", 
                "Raw OCR", "OCR Confidence %", "Camera", "Direction", 
                "First Seen", "Last Seen", "Status"
            ]
            ws.append(headers)
            
            for v in vehicles:
                ws.append([
                    v.get("track_id", ""),
                    v.get("vehicle_type", ""),
                    v.get("license_plate", ""),
                    v.get("canonical_plate", ""),
                    v.get("raw_ocr", ""),
                    v.get("ocr_confidence", 0.0),
                    v.get("camera_id", ""),
                    v.get("direction", ""),
                    v.get("first_seen", ""),
                    v.get("last_seen", ""),
                    v.get("status", "")
                ])
                
            buffer = io.BytesIO()
            wb.save(buffer)
            return buffer.getvalue()
        except ImportError:
            # Fallback to UTF-8 CSV bytes
            return ExportService.generate_csv(vehicles).encode('utf-8')

    @staticmethod
    def generate_pdf(vehicles: List[Dict[str, Any]]) -> bytes:
        """Generates formatted PDF report bytes for ANPR records."""
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet
            from reportlab.lib import colors

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            styles = getSampleStyleSheet()
            elements = []

            # Title
            elements.append(Paragraph("<b>NEUROFLOW — VEHICLE INTELLIGENCE REPORT</b>", styles['Title']))
            elements.append(Paragraph(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
            elements.append(Spacer(1, 15))

            # Table Data
            data = [["Track ID", "Type", "Plate", "Conf %", "Camera", "First Seen", "Status"]]
            for v in vehicles[:30]:
                data.append([
                    str(v.get("track_id", "")),
                    str(v.get("vehicle_type", "")),
                    str(v.get("license_plate", "")),
                    f"{v.get('ocr_confidence', 0.0)}%",
                    str(v.get("camera_id", "")),
                    str(v.get("first_seen", "")),
                    str(v.get("status", ""))
                ])

            t = Table(data)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 8),
                ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F8FAFC')),
                ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
            ]))
            elements.append(t)
            doc.build(elements)
            return buffer.getvalue()
        except ImportError:
            # Fallback simple text PDF buffer
            return f"NEUROFLOW ANPR REPORT - {len(vehicles)} VEHICLES RECORDED".encode('utf-8')

    @staticmethod
    def generate_incident_csv(incidents: List[Dict[str, Any]]) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow([
            "Incident ID", "Type", "Severity", "Priority", "Confidence %", 
            "Camera", "Timestamp", "Status", "Assigned Operator", "Vehicles Involved"
        ])
        
        for inc in incidents:
            writer.writerow([
                inc.get("id", ""),
                inc.get("incident_type", ""),
                inc.get("severity", ""),
                inc.get("priority", ""),
                inc.get("confidence", 0.0),
                inc.get("camera_id", ""),
                inc.get("timestamp", ""),
                inc.get("status", ""),
                inc.get("assigned_operator", ""),
                inc.get("vehicles_involved", "")
            ])
            
        return output.getvalue()

    @staticmethod
    def generate_incident_pdf(incidents: List[Dict[str, Any]]) -> bytes:
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet
            from reportlab.lib import colors

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            styles = getSampleStyleSheet()
            elements = []

            elements.append(Paragraph("<b>NEUROFLOW — EMERGENCY INCIDENT MANAGEMENT REPORT</b>", styles['Title']))
            elements.append(Paragraph(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
            elements.append(Spacer(1, 15))

            data = [["Incident ID", "Type", "Sev", "Prio", "Camera", "Status", "Time"]]
            for inc in incidents[:30]:
                data.append([
                    str(inc.get("id", ""))[:8],
                    str(inc.get("incident_type", "")),
                    str(inc.get("severity", "")),
                    str(inc.get("priority", "")),
                    str(inc.get("camera_id", "")),
                    str(inc.get("status", "")),
                    str(inc.get("timestamp", ""))
                ])

            t = Table(data)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EF4444')),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 8),
                ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#FEF2F2')),
                ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#FCA5A5')),
            ]))
            elements.append(t)
            doc.build(elements)
            return buffer.getvalue()
        except ImportError:
            return f"NEUROFLOW EMERGENCY INCIDENT REPORT - {len(incidents)} INCIDENTS RECORDED".encode('utf-8')

export_service = ExportService()
