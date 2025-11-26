"""
AgroUnify AI - Price Prediction Data Processing
Advanced data processing for market price prediction
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder, MinMaxScaler
from sklearn.feature_selection import SelectKBest, f_regression
import warnings
warnings.filterwarnings('ignore')

class PricePredictionProcessor:
    """Advanced data processing for price prediction models"""
    
    def __init__(self):
        self.scalers = {}
        self.encoders = {}
        self.feature_selectors = {}
        self.feature_columns = []
        
    def create_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create advanced features for price prediction"""
        
        df = data.copy()
        
        # Time-based features
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])
            df['year'] = df['date'].dt.year
            df['month'] = df['date'].dt.month
            df['day'] = df['date'].dt.day
            df['day_of_year'] = df['date'].dt.dayofyear
            df['week_of_year'] = df['date'].dt.weekofyear
            df['quarter'] = df['date'].dt.quarter
            
            # Cyclical encoding for seasonal patterns
            df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
            df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
            df['day_sin'] = np.sin(2 * np.pi * df['day_of_year'] / 365)
            df['day_cos'] = np.cos(2 * np.pi * df['day_of_year'] / 365)
        
        # Price-based features
        if 'price' in df.columns:
            # Lagged features
            for lag in [1, 7, 14, 30]:
                df[f'price_lag_{lag}'] = df['price'].shift(lag)
            
            # Moving averages
            for window in [7, 14, 30, 60]:
                df[f'price_ma_{window}'] = df['price'].rolling(window=window).mean()
                df[f'price_std_{window}'] = df['price'].rolling(window=window).std()
            
            # Price volatility
            df['price_volatility_7d'] = df['price'].rolling(window=7).std() / df['price'].rolling(window=7).mean()
            df['price_volatility_30d'] = df['price'].rolling(window=30).std() / df['price'].rolling(window=30).mean()
            
            # Price momentum
            df['price_momentum_7d'] = (df['price'] - df['price'].shift(7)) / df['price'].shift(7)
            df['price_momentum_30d'] = (df['price'] - df['price'].shift(30)) / df['price'].shift(30)
            
            # Relative strength index (RSI)
            df['price_rsi'] = self._calculate_rsi(df['price'])
        
        # Supply and demand features
        if 'arrival_quantity' in df.columns:
            # Lagged arrival quantities
            for lag in [1, 7, 14]:
                df[f'arrival_lag_{lag}'] = df['arrival_quantity'].shift(lag)
            
            # Moving averages of arrivals
            for window in [7, 14, 30]:
                df[f'arrival_ma_{window}'] = df['arrival_quantity'].rolling(window=window).mean()
            
            # Supply shock indicators
            df['supply_shock'] = (df['arrival_quantity'] - df['arrival_quantity'].rolling(window=30).mean()) / df['arrival_quantity'].rolling(window=30).std()
        
        # Weather-based features
        weather_cols = ['temperature', 'rainfall', 'humidity']
        for col in weather_cols:
            if col in df.columns:
                # Lagged weather features
                for lag in [1, 7, 14]:
                    df[f'{col}_lag_{lag}'] = df[col].shift(lag)
                
                # Weather moving averages
                for window in [7, 14, 30]:
                    df[f'{col}_ma_{window}'] = df[col].rolling(window=window).mean()
                
                # Weather anomalies
                df[f'{col}_anomaly'] = (df[col] - df[col].rolling(window=30).mean()) / df[col].rolling(window=30).std()
        
        # Market sentiment features
        if 'volume' in df.columns:
            # Volume-based features
            df['volume_ma_7'] = df['volume'].rolling(window=7).mean()
            df['volume_ratio'] = df['volume'] / df['volume_ma_7']
            
            # Price-volume relationship
            df['price_volume_corr'] = df['price'].rolling(window=30).corr(df['volume'])
        
        # Seasonal adjustment features
        crop_col = 'crop_type' if 'crop_type' in df.columns else 'crop'
        if crop_col in df.columns:
            # Create crop-specific seasonal patterns
            crop_seasonal = df.groupby([crop_col, 'month'])['price'].transform('mean') if 'price' in df.columns else None
            if crop_seasonal is not None:
                df['seasonal_price_pattern'] = crop_seasonal
        
        # External market features
        if 'international_price' in df.columns:
            df['international_price_ratio'] = df['price'] / df['international_price'] if 'price' in df.columns else np.nan
            df['international_price_ma_30'] = df['international_price'].rolling(window=30).mean()
        
        # Government policy features
        if 'msp' in df.columns:
            df['price_to_msp_ratio'] = df['price'] / df['msp'] if 'price' in df.columns else np.nan
            df['msp_support_indicator'] = (df['price'] <= df['msp'] * 1.1).astype(int) if 'price' in df.columns else 0
        
        return df
    
    def _calculate_rsi(self, prices: pd.Series, window: int = 14) -> pd.Series:
        """Calculate Relative Strength Index"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def encode_categorical_features(self, df: pd.DataFrame, categorical_cols: list) -> pd.DataFrame:
        """Encode categorical features"""
        
        df_encoded = df.copy()
        
        for col in categorical_cols:
            if col in df_encoded.columns:
                if col not in self.encoders:
                    self.encoders[col] = LabelEncoder()
                    df_encoded[col] = self.encoders[col].fit_transform(df_encoded[col].astype(str))
                else:
                    df_encoded[col] = self.encoders[col].transform(df_encoded[col].astype(str))
        
        return df_encoded
    
    def scale_features(self, df: pd.DataFrame, numerical_cols: list, scaler_type: str = 'standard') -> pd.DataFrame:
        """Scale numerical features"""
        
        df_scaled = df.copy()
        
        for col in numerical_cols:
            if col in df_scaled.columns:
                if col not in self.scalers:
                    if scaler_type == 'standard':
                        self.scalers[col] = StandardScaler()
                    elif scaler_type == 'minmax':
                        self.scalers[col] = MinMaxScaler()
                    else:
                        continue
                    
                    df_scaled[col] = self.scalers[col].fit_transform(df_scaled[[col]])
                else:
                    df_scaled[col] = self.scalers[col].transform(df_scaled[[col]])
        
        return df_scaled
    
    def select_features(self, X: pd.DataFrame, y: pd.Series, k: int = 50) -> pd.DataFrame:
        """Select top k features using statistical tests"""
        
        # Remove non-numeric columns and handle missing values
        numeric_cols = X.select_dtypes(include=[np.number]).columns
        X_numeric = X[numeric_cols].fillna(X[numeric_cols].mean())
        
        if len(numeric_cols) <= k:
            self.feature_columns = list(numeric_cols)
            return X_numeric
        
        # Feature selection
        selector = SelectKBest(score_func=f_regression, k=k)
        X_selected = selector.fit_transform(X_numeric, y)
        
        # Get selected feature names
        selected_features = X_numeric.columns[selector.get_support()]
        self.feature_columns = list(selected_features)
        
        return pd.DataFrame(X_selected, columns=selected_features, index=X.index)
    
    def create_lag_features(self, df: pd.DataFrame, target_col: str, lags: list) -> pd.DataFrame:
        """Create lagged features for time series"""
        
        df_with_lags = df.copy()
        
        for lag in lags:
            df_with_lags[f'{target_col}_lag_{lag}'] = df_with_lags[target_col].shift(lag)
        
        return df_with_lags
    
    def create_rolling_features(self, df: pd.DataFrame, target_col: str, windows: list) -> pd.DataFrame:
        """Create rolling window features"""
        
        df_with_rolling = df.copy()
        
        for window in windows:
            df_with_rolling[f'{target_col}_rolling_mean_{window}'] = df_with_rolling[target_col].rolling(window=window).mean()
            df_with_rolling[f'{target_col}_rolling_std_{window}'] = df_with_rolling[target_col].rolling(window=window).std()
            df_with_rolling[f'{target_col}_rolling_min_{window}'] = df_with_rolling[target_col].rolling(window=window).min()
            df_with_rolling[f'{target_col}_rolling_max_{window}'] = df_with_rolling[target_col].rolling(window=window).max()
        
        return df_with_rolling
    
    def handle_missing_values(self, df: pd.DataFrame, strategy: str = 'forward_fill') -> pd.DataFrame:
        """Handle missing values in the dataset"""
        
        df_filled = df.copy()
        
        if strategy == 'forward_fill':
            df_filled = df_filled.fillna(method='ffill')
        elif strategy == 'backward_fill':
            df_filled = df_filled.fillna(method='bfill')
        elif strategy == 'interpolate':
            numeric_cols = df_filled.select_dtypes(include=[np.number]).columns
            df_filled[numeric_cols] = df_filled[numeric_cols].interpolate()
        elif strategy == 'mean':
            numeric_cols = df_filled.select_dtypes(include=[np.number]).columns
            df_filled[numeric_cols] = df_filled[numeric_cols].fillna(df_filled[numeric_cols].mean())
        
        return df_filled
    
    def detect_outliers(self, df: pd.DataFrame, columns: list, method: str = 'iqr') -> pd.DataFrame:
        """Detect and handle outliers"""
        
        df_clean = df.copy()
        
        for col in columns:
            if col in df_clean.columns:
                if method == 'iqr':
                    Q1 = df_clean[col].quantile(0.25)
                    Q3 = df_clean[col].quantile(0.75)
                    IQR = Q3 - Q1
                    lower_bound = Q1 - 1.5 * IQR
                    upper_bound = Q3 + 1.5 * IQR
                    
                    # Cap outliers
                    df_clean[col] = df_clean[col].clip(lower=lower_bound, upper=upper_bound)
                
                elif method == 'zscore':
                    z_scores = np.abs((df_clean[col] - df_clean[col].mean()) / df_clean[col].std())
                    df_clean.loc[z_scores > 3, col] = df_clean[col].median()
        
        return df_clean