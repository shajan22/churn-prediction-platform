import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler

class DataPreprocessor:
    def __init__(self):
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.original_data = None
        self.original_data_copy = None
        self.processed_data = None
        
    def load_data(self, filepath):
        if filepath.endswith('.csv'):
            self.original_data = pd.read_csv(filepath)
            assert self.original_data is not None
            self.original_data_copy = self.original_data.copy()
        elif filepath.endswith(('.xlsx', '.xls')):
            self.original_data = pd.read_excel(filepath)
            assert self.original_data is not None
            self.original_data_copy = self.original_data.copy()
        else:
            raise ValueError('Unsupported file format')
        return self.original_data
    
    def get_missing_values_info(self):
        assert self.original_data is not None
        missing = self.original_data.isnull().sum()
        missing_percent = (missing / len(self.original_data)) * 100
        return {
            'total': int(missing.sum()),
            'by_column': {col: int(val) for col, val in missing.items() if val > 0},
            'percentage': {col: float(val) for col, val in missing_percent.items() if val > 0}
        }
    
    def handle_missing_values(self):
        assert self.original_data is not None
        df = self.original_data.copy()
        
        for column in df.columns:
            if df[column].isnull().sum() > 0:
                if df[column].dtype in ['float64', 'int64']:
                    df[column] = df[column].fillna(df[column].median())  # type: ignore
                else:
                    df[column] = df[column].fillna(df[column].mode()[0])  # type: ignore
        
        return df
    
    def remove_duplicates(self, df):
        initial_rows = len(df)
        df = df.drop_duplicates()
        duplicates_removed = initial_rows - len(df)
        return df, duplicates_removed
    
    def encode_categorical_variables(self, df):
        categorical_columns = df.select_dtypes(include=['object']).columns
        encoded_columns = []
        
        for column in categorical_columns:
            if column.lower() not in ['customerid', 'id']:
                le = LabelEncoder()
                df[column] = le.fit_transform(df[column].astype(str))
                self.label_encoders[column] = le
                encoded_columns.append(column)
        
        return df, encoded_columns
    
    def scale_numeric_features(self, df):
        numeric_columns = df.select_dtypes(include=['float64', 'int64']).columns
        scaled_columns = []
        
        # Columns to exclude from scaling (case-insensitive check)
        exclude_cols = [
            'customerid', 'id', 'customer_id', 'user_id', 
            'churn', 'churned', 'is_churned', 'ischurned',
            'exited', 'is_exited', 'isexited',
            'is_churn', 'ischurn', 'status', 'left', 'attrition'
        ]
        
        for column in numeric_columns:
            if column.lower() not in exclude_cols:
                df[column] = self.scaler.fit_transform(df[[column]])
                scaled_columns.append(column)
        
        return df, scaled_columns
    
    def validate_data(self, df):
        validations = {
            'has_missing_values': bool(df.isnull().sum().sum() == 0),
            'has_duplicates': bool(df.duplicated().sum() == 0),
            'row_count': int(len(df)),
            'column_count': int(len(df.columns)),
            'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()}
        }
        return validations
    
    def preprocess(self, filepath):
        self.load_data(filepath)
        
        assert self.original_data is not None
        assert self.original_data_copy is not None
        original_rows = len(self.original_data)
        missing_info = self.get_missing_values_info()
        
        df = self.handle_missing_values()
        df, duplicates_removed = self.remove_duplicates(df)
        df, encoded_columns = self.encode_categorical_variables(df)
        df, scaled_columns = self.scale_numeric_features(df)
        
        self.processed_data = df
        validation = self.validate_data(df)
        
        # Get sample of preprocessed data
        sample_data = df.head(10).to_dict('records')
        
        for record in sample_data:
            for key, value in record.items():
                if pd.isna(value):
                    record[key] = None  # type: ignore
                elif isinstance(value, np.integer):
                    record[key] = int(value)  # type: ignore
                elif isinstance(value, np.floating):
                    record[key] = float(value)  # type: ignore
                elif isinstance(value, np.bool_):
                    record[key] = bool(value)  # type: ignore
        
        # Get sample of original data
        original_sample = self.original_data_copy.head(10).to_dict('records')
        
        for record in original_sample:
            for key, value in record.items():
                if pd.isna(value):
                    record[key] = None  # type: ignore
                elif isinstance(value, np.integer):
                    record[key] = int(value)  # type: ignore
                elif isinstance(value, np.floating):
                    record[key] = float(value)  # type: ignore
                elif isinstance(value, np.bool_):
                    record[key] = bool(value)  # type: ignore
        
        return {
            'originalRows': int(original_rows),
            'cleanedRows': int(len(df)),
            'featuresCount': int(len(df.columns)),  # type: ignore
            'missingValuesHandled': int(missing_info['total']),
            'duplicatesRemoved': int(duplicates_removed),
            'categoricalEncoded': int(len(encoded_columns)),
            'numericScaled': int(len(scaled_columns)),
            'sampleData': sample_data,
            'originalSampleData': original_sample,
            'originalColumns': list(self.original_data.columns),
            'validation': validation,
            'columns': list(df.columns)
        }
    
    def get_processed_data(self):
        return self.processed_data
