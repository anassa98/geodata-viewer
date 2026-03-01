from django.contrib.gis.db import models


class Layer(models.Model):
    """A logical grouping of features (e.g. 'roads', 'buildings')."""

    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    style = models.JSONField(
        default=dict,
        blank=True,
        help_text="Default map style: {color, weight, opacity, fillColor, fillOpacity}",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Feature(models.Model):
    """A single vector feature with geometry + arbitrary properties."""

    layer = models.ForeignKey(Layer, on_delete=models.CASCADE, related_name="features")
    name = models.CharField(max_length=255, blank=True)
    geometry = models.GeometryField(srid=4326)
    properties = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["layer"]),
        ]

    def __str__(self):
        return self.name or f"Feature {self.pk}"
