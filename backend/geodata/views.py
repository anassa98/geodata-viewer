from django.contrib.gis.geos import Polygon
from django.db.models import Count
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_gis.filters import InBBoxFilter

from .models import Layer, Feature
from .serializers import LayerSerializer, FeatureSerializer


class LayerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/layers/          – list all layers (with feature count)
    GET /api/layers/<id>/     – single layer detail
    """

    serializer_class = LayerSerializer

    def get_queryset(self):
        return Layer.objects.annotate(feature_count=Count("features")).order_by("name")


class FeatureViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/features/                – GeoJSON FeatureCollection
    GET /api/features/<id>/           – single GeoJSON Feature
    GET /api/features/?layer=<id>     – filter by layer
    GET /api/features/?in_bbox=W,S,E,N – spatial bounding-box filter
    GET /api/features/bbox_geojson/?in_bbox=W,S,E,N – unpaginated for map tiles
    """

    serializer_class = FeatureSerializer
    bbox_filter_field = "geometry"
    filter_backends = [InBBoxFilter]

    def get_queryset(self):
        qs = Feature.objects.select_related("layer")
        layer_id = self.request.query_params.get("layer")
        if layer_id:
            qs = qs.filter(layer_id=layer_id)
        return qs.order_by("id")

    @action(detail=False, methods=["get"], url_path="bbox_geojson")
    def bbox_geojson(self, request):
        """Return all features in a bounding box without pagination (for map use)."""
        bbox_param = request.query_params.get("in_bbox")
        qs = self.get_queryset()

        if bbox_param:
            try:
                coords = [float(c) for c in bbox_param.split(",")]
                if len(coords) != 4:
                    raise ValueError
                bbox_poly = Polygon.from_bbox(coords)
                qs = qs.filter(geometry__intersects=bbox_poly)
            except (ValueError, TypeError):
                return Response(
                    {"error": "in_bbox must be 4 comma-separated floats: W,S,E,N"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Cap at 5000 to avoid overwhelming the browser
        qs = qs[:5000]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
