"""
Management command to seed the database with sample vector data for demo purposes.
Usage: python manage.py seed_demo
"""

import random
from django.contrib.gis.geos import Point, LineString, Polygon
from django.core.management.base import BaseCommand
from geodata.models import Layer, Feature


class Command(BaseCommand):
    help = "Seed database with sample vector data (points, lines, polygons)"

    def handle(self, *args, **options):
        # --- Points layer (e.g. city landmarks) ---
        points_layer, _ = Layer.objects.get_or_create(
            name="Landmarks",
            defaults={
                "description": "Points of interest",
                "style": {"color": "#e74c3c", "weight": 2, "fillOpacity": 0.7},
            },
        )
        landmarks = [
            ("Statue of Liberty", -74.0445, 40.6892, {"type": "monument"}),
            ("Central Park", -73.9654, 40.7829, {"type": "park"}),
            ("Empire State Building", -73.9857, 40.7484, {"type": "building"}),
            ("Brooklyn Bridge", -73.9969, 40.7061, {"type": "bridge"}),
            ("Times Square", -73.9855, 40.7580, {"type": "plaza"}),
        ]
        for name, lon, lat, props in landmarks:
            Feature.objects.get_or_create(
                layer=points_layer,
                name=name,
                defaults={"geometry": Point(lon, lat, srid=4326), "properties": props},
            )

        # --- Lines layer (e.g. routes) ---
        lines_layer, _ = Layer.objects.get_or_create(
            name="Routes",
            defaults={
                "description": "Walking routes",
                "style": {"color": "#3498db", "weight": 4, "opacity": 0.8},
            },
        )
        Feature.objects.get_or_create(
            layer=lines_layer,
            name="Broadway Walk",
            defaults={
                "geometry": LineString(
                    (-73.9930, 40.7063),
                    (-73.9888, 40.7234),
                    (-73.9878, 40.7395),
                    (-73.9857, 40.7484),
                    (-73.9855, 40.7580),
                    srid=4326,
                ),
                "properties": {"distance_km": 5.8, "difficulty": "easy"},
            },
        )

        # --- Polygons layer (e.g. zones) ---
        poly_layer, _ = Layer.objects.get_or_create(
            name="Zones",
            defaults={
                "description": "District boundaries",
                "style": {
                    "color": "#2ecc71",
                    "weight": 2,
                    "fillColor": "#2ecc71",
                    "fillOpacity": 0.25,
                },
            },
        )
        Feature.objects.get_or_create(
            layer=poly_layer,
            name="Midtown",
            defaults={
                "geometry": Polygon(
                    (
                        (-73.9950, 40.7480),
                        (-73.9700, 40.7480),
                        (-73.9700, 40.7620),
                        (-73.9950, 40.7620),
                        (-73.9950, 40.7480),
                    ),
                    srid=4326,
                ),
                "properties": {"population": 52000, "area_km2": 2.3},
            },
        )
        Feature.objects.get_or_create(
            layer=poly_layer,
            name="Lower Manhattan",
            defaults={
                "geometry": Polygon(
                    (
                        (-74.0200, 40.6990),
                        (-73.9700, 40.6990),
                        (-73.9700, 40.7200),
                        (-74.0200, 40.7200),
                        (-74.0200, 40.6990),
                    ),
                    srid=4326,
                ),
                "properties": {"population": 38000, "area_km2": 4.5},
            },
        )

        # Random scatter for stress-testing
        random.seed(42)
        scatter_layer, _ = Layer.objects.get_or_create(
            name="Sensor Network",
            defaults={
                "description": "Random sensor readings",
                "style": {"color": "#9b59b6", "weight": 1, "fillOpacity": 0.6},
            },
        )
        if scatter_layer.features.count() == 0:
            features = []
            for i in range(200):
                lon = -74.05 + random.random() * 0.12
                lat = 40.68 + random.random() * 0.12
                features.append(
                    Feature(
                        layer=scatter_layer,
                        name=f"Sensor-{i:03d}",
                        geometry=Point(lon, lat, srid=4326),
                        properties={
                            "temperature": round(random.uniform(15, 35), 1),
                            "humidity": round(random.uniform(30, 90), 1),
                        },
                    )
                )
            Feature.objects.bulk_create(features)

        total = Feature.objects.count()
        self.stdout.write(self.style.SUCCESS(f"Seeded {total} features across {Layer.objects.count()} layers"))
