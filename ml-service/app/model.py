import numpy as np
from sklearn.ensemble import RandomForestRegressor
import math

class WaitingTimePredictor:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=50, random_state=42)
        self._train_bootstrap_model()

    def _train_bootstrap_model(self):
        # Generate bootstrap synthetic training dataset matching real procurement dynamics
        np.random.seed(42)
        num_samples = 500

        # Features: [farmersAhead, totalQuantityAhead, activeCounters, avgProcessingSpeed, hourOfDay, centerCapacity]
        X = []
        y = []

        for _ in range(num_samples):
            farmers_ahead = np.random.randint(0, 30)
            total_qty_ahead = farmers_ahead * np.random.uniform(10, 25)
            active_counters = np.random.randint(2, 6)
            avg_speed = np.random.uniform(5.5, 9.5)
            hour = np.random.randint(8, 17)
            center_capacity = 1000

            # Ground truth wait formula with real-world noise
            base_wait = (farmers_ahead * avg_speed) / max(1, active_counters)
            volume_bonus = (total_qty_ahead / 20.0) * 0.5
            peak_multiplier = 1.15 if 10 <= hour <= 13 else 1.0
            noise = np.random.normal(0, 2.5)

            actual_wait = max(3.0, (base_wait + volume_bonus) * peak_multiplier + noise)

            X.append([farmers_ahead, total_qty_ahead, active_counters, avg_speed, hour, center_capacity])
            y.append(actual_wait)

        X = np.array(X)
        y = np.array(y)
        self.model.fit(X, y)

    def predict(self, farmers_ahead: int, queue_size: int, total_qty_ahead: float, farmer_qty: float,
                avg_speed: float, active_counters: int, center_capacity: float, hour: int):
        
        features = np.array([[farmers_ahead, total_qty_ahead, active_counters, avg_speed, hour, center_capacity]])
        predicted_wait = float(self.model.predict(features)[0])

        predicted_minutes = max(4, int(round(predicted_wait)))
        min_minutes = max(2, int(round(predicted_minutes * 0.82)))
        max_minutes = int(round(predicted_minutes * 1.28))
        confidence = round(max(0.70, min(0.95, 0.92 - (farmers_ahead * 0.008))), 2)

        # Explainable factor breakdown
        factors = [
            {"name": f"Farmers Ahead ({farmers_ahead})", "impact": "high" if farmers_ahead > 5 else "medium"},
            {"name": f"Active Counters ({active_counters})", "impact": "high" if active_counters < 4 else "medium"},
            {"name": f"Avg Processing Speed ({avg_speed} min)", "impact": "medium"},
            {"name": f"Volume Ahead ({round(total_qty_ahead, 1)} Tons)", "impact": "high" if total_qty_ahead > 80 else "low"},
            {"name": f"Time of Day ({hour}:00)", "impact": "low"},
        ]

        return {
            "predictedMinutes": predicted_minutes,
            "minMinutes": min_minutes,
            "maxMinutes": max_minutes,
            "confidence": confidence,
            "factors": factors
        }

# Global predictor instance
predictor = WaitingTimePredictor()
