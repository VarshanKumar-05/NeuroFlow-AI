from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/daily_summary.pdf")
async def export_daily_summary_pdf():
    # Create an in-memory PDF
    output = io.BytesIO()
    c = canvas.Canvas(output, pagesize=letter)
    
    # Title
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, 750, "NeuroFlow AI - Daily Traffic Summary")
    
    # Content
    c.setFont("Helvetica", 14)
    c.drawString(50, 700, "Date: Today")
    c.drawString(50, 670, "Total Vehicles Processed: 42,105")
    c.drawString(50, 640, "Average Speed: 34.2 mph")
    c.drawString(50, 610, "Incidents Detected: 12")
    c.drawString(50, 580, "Overall Network Status: Healthy")
    
    # Save the PDF
    c.showPage()
    c.save()
    
    # Seek to start
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=neuroflow_daily_report.pdf"}
    )
