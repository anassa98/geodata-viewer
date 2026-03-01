from django.contrib.gis import admin
from .models import Layer, Feature


@admin.register(Layer)
class LayerAdmin(admin.ModelAdmin):
    list_display = ["name", "description", "created_at"]


@admin.register(Feature)
class FeatureAdmin(admin.GISModelAdmin):
    list_display = ["name", "layer", "created_at"]
    list_filter = ["layer"]
