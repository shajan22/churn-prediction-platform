import sys
sys.path.append('.')

from services.preprocessing_service import DataPreprocessor

if __name__ == "__main__":
    sample_file = 'uploads/0_customer_churn_dataset-training-master.csv'

    preprocessor = DataPreprocessor()
    result = preprocessor.preprocess(sample_file)

    print('=== Preprocessing Results ===')
    print(f'Original Rows: {result["originalRows"]}')
    print(f'Cleaned Rows: {result["cleanedRows"]}')
    print(f'Features Count: {result["featuresCount"]}')
    print(f'\nColumns in processed data:')
    for col in result['columns']:
        print(f'  - {col}')

    print(f'\nValidation:')
    print(f'  Has missing values: {result["validation"]["has_missing_values"]}')
    print(f'  Has duplicates: {result["validation"]["has_duplicates"]}')

    print(f'\nSample Data (first row):')
    if result['sampleData']:
        first_row = result['sampleData'][0]
        for key, value in first_row.items():
            print(f'  {key}: {value}')
