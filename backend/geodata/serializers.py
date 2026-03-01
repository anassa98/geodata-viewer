from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Layer, Feature


class LayerSerializer(serializers.ModelSerializer):
    feature_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Layer
        fields = ["id", "name", "description", "style", "feature_count", "created_at"]


class FeatureSerializer(GeoFeatureModelSerializer):
    """Serialises Feature instances as GeoJSON Feature objects."""

    layer_name = serializers.CharField(source="layer.name", read_only=True)

    class Meta:
        model = Feature
        geo_field = "geometry"
        fields = ["id", "name", "layer", "layer_name", "properties", "created_at"]
