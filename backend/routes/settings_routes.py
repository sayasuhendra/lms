from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from auth import get_current_admin
from database import AppSetting, AsyncSessionLocal
from models import AppSettings, AppSettingsUpdate

router = APIRouter(prefix="/settings", tags=["Settings"])

DEFAULT_SETTINGS = {
    "organization_name": "Nama Organisasi",
}


async def get_setting_value(key: str) -> str:
    """Return a persisted app setting value, falling back to the product default."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(AppSetting).where(AppSetting.key == key))
        setting = result.scalar_one_or_none()
        if setting:
            return setting.value
    return DEFAULT_SETTINGS[key]


@router.get("", response_model=AppSettings)
async def get_settings():
    """Get public application settings used for runtime branding."""
    return AppSettings(
        organization_name=await get_setting_value("organization_name")
    )


@router.put("", response_model=AppSettings)
async def update_settings(
    payload: AppSettingsUpdate,
    current_user: dict = Depends(get_current_admin)
):
    """Update application settings. Restricted to administrators."""
    organization_name = payload.organization_name.strip()
    if len(organization_name) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization name must be at least 2 characters"
        )

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(AppSetting).where(AppSetting.key == "organization_name")
        )
        setting = result.scalar_one_or_none()

        if setting:
            setting.value = organization_name
        else:
            session.add(AppSetting(key="organization_name", value=organization_name))

        await session.commit()

    return AppSettings(organization_name=organization_name)
