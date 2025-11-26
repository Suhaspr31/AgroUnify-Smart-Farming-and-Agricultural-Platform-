import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

# Generate sample dataset for crop recommendation
# Features: temperature, rainfall, ph, nitrogen, phosphorus, potassium
# Target: crop (e.g., Rice, Wheat, Maize, etc.)

data = {
    'temperature': [25, 30, 20, 28, 22, 26, 24, 29, 21, 27, 15, 35, 18, 32, 19, 31, 23, 27, 16, 33],
    'rainfall': [200, 150, 300, 180, 250, 220, 190, 160, 280, 210, 350, 120, 320, 140, 290, 130, 240, 170, 310, 110],
    'ph': [6.5, 7.0, 5.8, 6.8, 6.2, 7.2, 6.0, 6.9, 5.5, 6.7, 5.2, 7.5, 5.9, 7.1, 6.1, 7.3, 6.3, 6.8, 5.7, 7.0],
    'nitrogen': [80, 60, 100, 70, 90, 85, 75, 65, 95, 78, 110, 50, 105, 55, 88, 62, 82, 72, 98, 58],
    'phosphorus': [40, 30, 50, 35, 45, 42, 38, 32, 48, 41, 55, 25, 52, 28, 46, 33, 44, 36, 49, 29],
    'potassium': [35, 25, 45, 30, 40, 37, 33, 28, 43, 36, 50, 20, 47, 22, 41, 26, 39, 31, 45, 24],
    'crop': ['Rice', 'Wheat', 'Maize', 'Rice', 'Maize', 'Rice', 'Wheat', 'Rice', 'Maize', 'Wheat', 'Rice', 'Wheat', 'Maize', 'Wheat', 'Rice', 'Wheat', 'Maize', 'Rice', 'Maize', 'Wheat']
}

df = pd.DataFrame(data)

# Features and target
X = df[['temperature', 'rainfall', 'ph', 'nitrogen', 'phosphorus', 'potassium']]
y = df['crop']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train Random Forest model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f'Model Accuracy: {accuracy}')

# Save model
os.makedirs('artifacts/crop_recommendation', exist_ok=True)
joblib.dump(model, 'artifacts/crop_recommendation/model.pkl')
print('Model saved as artifacts/crop_recommendation/model.pkl')