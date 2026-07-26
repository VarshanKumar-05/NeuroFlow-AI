"""
Report service — generation, retrieval, download.
"""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.report_repo import ReportRepository
from app.schemas.report import ReportCreate, ReportList, ReportResponse


class ReportService:
    """Business logic for analytics report generation and management."""

    def __init__(self, db: AsyncSession) -> None:
        self._repo = ReportRepository(db)

    async def create(self, data: ReportCreate, user_id: UUID | None = None) -> ReportResponse:
        """Create a new report record.

        ``generate_pdf`` is a placeholder — in production this would
        call ReportLab / WeasyPrint to produce a PDF and upload to S3.
        """
        file_url = self._generate_pdf(data)
        report = await self._repo.create(
            {
                "title": data.title,
                "type": data.type,
                "file_url": file_url,
                "format": "pdf",
                "created_by": user_id,
                "parameters": data.parameters,
            }
        )
        return ReportResponse.model_validate(report)

    def _generate_pdf(self, data: ReportCreate) -> str:
        """Placeholder PDF generation — returns a fake URL.

        Will be replaced with ReportLab integration.
        """
        slug = data.title.lower().replace(" ", "-")
        return f"/reports/{slug}.pdf"

    async def get_by_user(
        self, user_id: UUID, page: int = 1, size: int = 20
    ) -> ReportList:
        """Return reports created by a specific user."""
        skip = (page - 1) * size
        reports = await self._repo.get_by_user(user_id, skip=skip, limit=size)
        total = len(reports)
        return ReportList(items=[ReportResponse.model_validate(r) for r in reports], total=total, page=page, size=size)

    async def get_all(self, page: int = 1, size: int = 20) -> ReportList:
        """Return paginated list of all reports."""
        skip = (page - 1) * size
        reports = await self._repo.get_multi(skip=skip, limit=size)
        total = await self._repo.count()
        return ReportList(
            items=[ReportResponse.model_validate(r) for r in reports],
            total=total,
            page=page,
            size=size,
        )

    async def get_by_id(self, report_id: UUID) -> ReportResponse:
        """Fetch a single report or 404."""
        report = await self._repo.get(report_id)
        if report is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found",
            )
        return ReportResponse.model_validate(report)

    async def download(self, report_id: UUID) -> dict[str, str]:
        """Return the download URL for a report.

        In production this would generate a pre-signed S3 URL.
        """
        report = await self._repo.get(report_id)
        if report is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found",
            )
        return {"file_url": report.file_url, "format": report.format}

    async def delete(self, report_id: UUID) -> bool:
        """Delete a report record."""
        deleted = await self._repo.delete(report_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found",
            )
        return True
