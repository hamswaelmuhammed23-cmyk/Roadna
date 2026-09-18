import pandas as pd
import os
import numpy as np
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# --------------------------
# App init
# --------------------------
app = Flask(__name__)
CORS(app)

# --------------------------
# Load dataset
# --------------------------
file_path = os.path.join(os.path.dirname(__file__), "dataset.xlsx")

if not os.path.exists(file_path):
    print(f"❌ Error: {file_path} not found!")
    exit(1)

df = pd.read_excel(file_path)

# --------------------------
# Clean data
# --------------------------
df['Category'] = df['Category'].fillna('unknown').str.strip().str.lower()
df['Tags'] = df['Tags'].fillna('').astype(str).apply(
    lambda x: ','.join([t.strip().lower() for t in x.split(',') if t.strip()])
)

# --------------------------
# Features
# --------------------------
df_category = pd.get_dummies(df['Category'], prefix='category')
df_tags = df['Tags'].str.get_dummies(sep=',')
features = pd.concat([df_category, df_tags], axis=1)

# --------------------------
# Target
# --------------------------
df['Classification'] = df['Classification'].fillna(0)
y = df['Classification']

# --------------------------
# Train model
# --------------------------
X_train, X_test, y_train, y_test = train_test_split(
    features, y, test_size=0.3, random_state=42
)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# --------------------------
# Metrics
# --------------------------
train_acc = model.score(X_train, y_train) * 100
test_acc = model.score(X_test, y_test) * 100
train_error = 100 - train_acc
test_error = 100 - test_acc

print("=" * 40)
print("🧠 AI MODEL EVALUATION METRICS")
print("=" * 40)
print(f"Training Accuracy : {train_acc:.2f}%")
print(f"Training Error    : {train_error:.2f}%\n")
print(f"Testing Accuracy  : {test_acc:.2f}%")
print(f"Testing Error     : {test_error:.2f}%")
print("=" * 40)


# --------------------------
# Recommendation function
# --------------------------
def recommend_by_category_or_tag(user_category, user_tags, top_n=50):
    user_category = user_category.strip().lower()
    user_tags = [t.strip().lower() for t in user_tags]

    # Build user input vector for model prediction
    user_input = pd.DataFrame(0, index=[0], columns=features.columns)

    cat_col = f"category_{user_category}"
    if cat_col in features.columns:
        user_input[cat_col] = 1

    for tag in user_tags:
        if tag in features.columns:
            user_input[tag] = 1

    predicted_class = model.predict(user_input)[0]
    

    # Filter by predicted class and category
    filtered = df[
        (df['Classification'] == predicted_class) &
        (df['Category'].str.strip().str.lower() == user_category)
    ].copy()

    # Further filter by tags if provided
    if user_tags:
        filtered = filtered[
            filtered['Tags'].apply(
                lambda x: any(tag in str(x).lower().split(',') for tag in user_tags)
            )
        ]

    filtered['AI_Predicted_Class'] = predicted_class

    # Match scoring
    def calculate_match_score(row):
        score = 0
        if str(row['Category']).strip().lower() == user_category:
            score += 10
        row_tags = str(row['Tags']).lower().split(',')
        for tag in user_tags:
            if tag in row_tags:
                score += 5
        return score

    if not filtered.empty:
        filtered['Match_Score'] = filtered.apply(calculate_match_score, axis=1)
        filtered = filtered.sort_values(by='Match_Score', ascending=False)
        filtered = filtered.drop(columns=['Match_Score'])

    return filtered.head(top_n), str(predicted_class)


# --------------------------
# Routes
# --------------------------

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "train_accuracy": f"{train_acc:.2f}%",
        "test_accuracy": f"{test_acc:.2f}%"
    })


@app.route('/categories', methods=['GET'])
def get_categories():
    try:
        all_categories = sorted(df['Category'].dropna().unique().tolist())
        category_tags = {}

        for cat in all_categories:
            cat_df = df[df['Category'] == cat]
            tag_set = set()
            for tags in cat_df['Tags']:
                for t in str(tags).split(','):
                    t = t.strip()
                    if t:
                        tag_set.add(t)
            category_tags[cat] = sorted(list(tag_set))

        return jsonify({
            "success": True,
            "categories": all_categories,
            "categoryTags": category_tags
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/items', methods=['GET'])
def get_all_items():
    try:
        items = df.to_dict(orient='records')
        for item in items:
            for key, value in item.items():
                if isinstance(value, float) and np.isnan(value):
                    item[key] = None
        return jsonify({
            "success": True,
            "count": len(items),
            "items": items
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route("/items-by-ids", methods=["POST"])
def items_by_ids():
    try:
        data = request.get_json()
        ids = [str(i) for i in data.get("ids", [])]
        
        if not ids:
            return jsonify({"success": True, "items": []})
        
        # Filter dataset by ID
        # Adjust 'ID' to match your actual column name
        filtered = df[df["ID"].astype(str).isin(ids)]
        
        items = filtered.to_dict(orient="records")
        
        return jsonify({"success": True, "items": items})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "error": "No JSON body received"}), 400

        category = data.get('category', '')
        tags = data.get('tags', [])
        top_n = data.get('top_n', 50)

        if not category:
            return jsonify({"success": False, "error": "Category is required"}), 400

        results, predicted_class = recommend_by_category_or_tag(category, tags, top_n)

        items = results.to_dict(orient='records')
        for item in items:
            for key, value in item.items():
                if isinstance(value, float) and np.isnan(value):
                    item[key] = None

        return jsonify({
            "success": True,
            "predicted_class": predicted_class,
            "count": len(items),
            "items": items
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# --------------------------
# Run
# --------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)