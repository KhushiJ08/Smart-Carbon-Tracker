                          : sustainabilityScore >= 40
                            ? "Moderate"
                            : "Needs Improvement"}
                    </p>

                    <p>
                      📍 Location: <strong>{city}</strong>
                    </p>
                  </>
                ) : (
                  <p>Loading sustainability score...</p>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              ENVIRONMENTAL ALERTS
          ================================================= */}

          <div className="environment-section">
            <h2 className="environment-title">
              🚨 Environmental Alerts & Recommendations
            </h2>

            <p className="environment-subtitle">
              Personalized suggestions based on current environmental
              conditions.
            </p>

            <div className="glass-card recommend-section">
              {getEnvironmentalRecommendation().map((recommendation, index) => (
                <p key={index}>{recommendation}</p>
              ))}
            </div>
          </div>

          {/* =================================================
              AQI CITY COMPARISON
          ================================================= */}

          <div className="environment-section">
            <h2 className="environment-title">🌍 Compare City AQI</h2>

            <p className="environment-subtitle">
              Compare air quality across different cities.
            </p>

            <div className="environment-cards">
              {comparisonLoading ? (
                <div className="glass-card environment-card">
                  <h3>🌫️ AQI Comparison</h3>

                  <p>Loading city AQI data...</p>
                </div>
              ) : aqiComparison.length > 0 ? (
                aqiComparison.map((item) => (
                  <div className="glass-card environment-card" key={item.city}>
                    <h3>📍 {item.city}</h3>

                    {item.available ? (
                      <>
                        <div className="environment-main-value">
                          AQI {item.AQI}
                        </div>

                        <p>
                          <strong>Status:</strong> {getAQIStatus(item.AQI)}
                        </p>

                        <p>
                          <strong>PM2.5:</strong> {item.PM25}
                        </p>

                        <p>
                          <strong>PM10:</strong> {item.PM10}
                        </p>
                      </>
                    ) : (
                      <p>Environmental data not available yet.</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="glass-card environment-card">
                  <h3>🌫️ AQI Comparison</h3>

                  <p>Unable to load city comparison data.</p>
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              AI RECOMMENDATIONS
          ================================================= */}

          <div className="glass-card recommend-section">
            <RecommendationBox activities={activities} />
          </div>
        </div>
      </div>
    </>
  );
}
