# Smart Carbon Tracker - Week 11 Functional Testing Report

## Objective

The objective of Week 11 was to perform functional testing of the Smart Carbon Tracker system. The testing process verified the correct working of authentication features, dashboard analytics, activity management, AI prediction modules, and recommendation systems. Both frontend and backend functionalities were tested to ensure stable and accurate system performance.

---

## Functional Testing Overview

Functional testing was carried out on all major modules of the application. The testing included authentication verification, dashboard rendering checks, analytics accuracy validation, API response testing, and AI prediction consistency checks. Each feature was tested using expected inputs and outputs to confirm proper functionality.

---

## Functional Testing Report

| Test Case ID | Feature Tested            | Expected Output                                | Actual Output                     | Status |
| ------------ | ------------------------- | ---------------------------------------------- | --------------------------------- | ------ |
| TC01         | User Signup               | User account should be created successfully    | User registered successfully      | Pass   |
| TC02         | User Login                | User should login with valid credentials       | Login successful                  | Pass   |
| TC03         | Invalid Password Handling | System should reject invalid password          | Error message displayed           | Pass   |
| TC04         | Logout Functionality      | User session should end after logout           | Logout successful                 | Pass   |
| TC05         | Session Persistence       | User should remain logged in after refresh     | Session maintained correctly      | Pass   |
| TC06         | Add Activity Data         | New activity should be added to database       | Activity added successfully       | Pass   |
| TC07         | Edit Activity Data        | Existing activity should update correctly      | Activity updated successfully     | Pass   |
| TC08         | Delete Activity Data      | Selected activity should be removed            | Activity deleted successfully     | Pass   |
| TC09         | Empty Field Handling      | System should prevent empty submissions        | Validation message displayed      | Pass   |
| TC10         | Data Validation           | Invalid inputs should be rejected              | Validation working correctly      | Pass   |
| TC11         | Dashboard Rendering       | Dashboard components should load properly      | Dashboard loaded successfully     | Pass   |
| TC12         | Charts Rendering          | Charts should display correct data             | Charts rendered correctly         | Pass   |
| TC13         | Real-time Updates         | Dashboard should update latest data            | Updates reflected correctly       | Pass   |
| TC14         | Comparison Analytics      | Analytics calculations should be accurate      | Correct comparison displayed      | Pass   |
| TC15         | Prediction API            | Prediction endpoint should return forecast     | Prediction generated successfully | Pass   |
| TC16         | Forecast Consistency      | Predictions should remain stable for same data | Consistent output observed        | Pass   |
| TC17         | Recommendation Generation | AI module should generate sustainability tips  | Recommendations generated         | Pass   |
| TC18         | Alert Logic               | System should trigger alerts on high emissions | Alert displayed correctly         | Pass   |

---

## API Testing

The backend APIs were tested using browser endpoints and local server execution. The APIs successfully returned JSON responses for total emissions, category analytics, AI recommendations, and prediction confidence values.

Tested APIs:

- `/api/analytics/total`
- `/api/analytics/category`
- `/api/analytics/recommendations`
- `/api/analytics/predict`

---

## Conclusion

Functional testing of the Smart Carbon Tracker application was completed successfully. All major system modules performed as expected during testing. Backend APIs returned correct responses, dashboard analytics displayed accurate data, and AI-based prediction and recommendation systems functioned properly. The application demonstrated stable performance across all tested features.
