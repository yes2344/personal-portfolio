from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from portfolio.views import AdminTokenObtainPairView, DashboardStatsView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("portfolio.urls")),
    path("api/v1/auth/token/", AdminTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/v1/admin/stats/", DashboardStatsView.as_view(), name="dashboard_stats"),
]
