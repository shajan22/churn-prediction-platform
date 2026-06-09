import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from xgboost import XGBClassifier

class ChurnPredictor:
    def __init__(self):
        self.models = {
            'Gradient Boosting (XGBoost)': XGBClassifier(random_state=42, use_label_encoder=False, eval_metric='logloss'),
            'Random Forest': RandomForestClassifier(random_state=42, n_estimators=100),
            'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
            'Support Vector Machine': SVC(random_state=42, probability=True),
            'Neural Network': MLPClassifier(random_state=42, max_iter=500, hidden_layer_sizes=(100, 50))
        }
        self.best_model = None
        self.best_model_name = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        
    def prepare_data(self, df, target_column='churn'):
        df_copy = df.copy()
        
        # Try to find the target column (case-insensitive)
        target_col = None
        for col in df_copy.columns:
            if col.lower() == target_column.lower():
                target_col = col
                break
        
        # If not found, raise a helpful error with available columns
        if target_col is None:
            available_cols = ', '.join(df_copy.columns.tolist())
            raise ValueError(f'Target column "{target_column}" not found in dataset. Available columns: {available_cols}')
        
        # Remove ID columns
        id_columns = [col for col in df_copy.columns if col.lower() in ['customerid', 'id']]
        if id_columns:
            df_copy = df_copy.drop(columns=id_columns)
        
        y = df_copy[target_col]
        X = df_copy.drop(columns=[target_col])
        
        # Handle different churn value formats
        if y.dtype == 'object':
            y = y.map({'Yes': 1, 'yes': 1, 'YES': 1, 'No': 0, 'no': 0, 'NO': 0, True: 1, False: 0})
        elif y.dtype == 'bool':
            y = y.astype(int)
        
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        return self.X_train, self.X_test, self.y_train, self.y_test
    
    def train_models(self):
        results = []
        
        for name, model in self.models.items():
            model.fit(self.X_train, self.y_train)
            y_pred = model.predict(self.X_test)
            
            accuracy = accuracy_score(self.y_test, y_pred)
            precision = precision_score(self.y_test, y_pred, average='binary')
            recall = recall_score(self.y_test, y_pred, average='binary')
            
            results.append({
                'name': name,
                'accuracy': float(accuracy),
                'precision': float(precision),
                'recall': float(recall)
            })
        
        best_result = max(results, key=lambda x: x['accuracy'])
        self.best_model_name = best_result['name']
        self.best_model = self.models[self.best_model_name]
        
        return results, self.best_model_name
    
    def get_predictions(self):
        assert self.best_model is not None
        assert self.X_test is not None
        assert self.X_train is not None
        assert self.y_test is not None
        
        y_pred = self.best_model.predict(self.X_test)
        
        accuracy = accuracy_score(self.y_test, y_pred)
        precision = precision_score(self.y_test, y_pred, average='binary')
        recall = recall_score(self.y_test, y_pred, average='binary')
        f1 = f1_score(self.y_test, y_pred, average='binary')
        
        cm = confusion_matrix(self.y_test, y_pred)
        tn, fp, fn, tp = cm.ravel()
        
        total_customers = len(self.X_train) + len(self.X_test)
        predicted_churn = int(np.sum(y_pred))
        predicted_retention = len(y_pred) - predicted_churn
        churn_rate = predicted_churn / len(y_pred)
        
        return {
            'accuracy': float(accuracy),
            'precision': float(precision),
            'recall': float(recall),
            'f1Score': float(f1),
            'churnRate': float(churn_rate),
            'totalCustomers': int(total_customers),
            'predictedChurn': int(predicted_churn),
            'predictedRetention': int(predicted_retention),
            'confusionMatrix': {
                'truePositive': int(tp),
                'falsePositive': int(fp),
                'trueNegative': int(tn),
                'falseNegative': int(fn)
            },
            'bestModel': self.best_model_name
        }
    
    def predict(self, df, target_column='churn'):
        self.prepare_data(df, target_column)
        model_comparison, best_model_name = self.train_models()
        predictions = self.get_predictions()
        predictions['modelComparison'] = model_comparison
        
        return predictions
