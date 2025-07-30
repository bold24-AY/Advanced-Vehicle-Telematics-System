import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

def load_and_analyze_telematics_data():
    """
    Load and analyze vehicle telematics data from CSV files
    """
    print("🚗 Vehicle Telematics Data Analysis")
    print("=" * 50)
    
    try:
        # Load vehicles data
        vehicles_df = pd.read_csv('vehicles_data_2024-01-30.csv')  # Update with actual filename
        print(f"✅ Loaded {len(vehicles_df)} vehicles")
        
        # Load anomalies data
        anomalies_df = pd.read_csv('anomalies_data_2024-01-30.csv')  # Update with actual filename
        print(f"✅ Loaded {len(anomalies_df)} anomalies")
        
    except FileNotFoundError as e:
        print(f"❌ Error loading CSV files: {e}")
        print("Please make sure to export data from the web application first!")
        return
    
    # Basic statistics
    print("\n📊 VEHICLE FLEET OVERVIEW")
    print("-" * 30)
    print(f"Total Vehicles: {len(vehicles_df)}")
    print(f"Active Vehicles: {len(vehicles_df[vehicles_df['State'] != 'OFFLINE'])}")
    print(f"Critical Vehicles: {len(vehicles_df[vehicles_df['State'] == 'CRITICAL'])}")
    print(f"Average Fleet Speed: {vehicles_df['Avg Speed (km/h)'].mean():.1f} km/h")
    print(f"Total Fleet Distance: {vehicles_df['Total Distance (km)'].sum():.1f} km")
    
    # Anomaly analysis
    print(f"\n🚨 ANOMALY ANALYSIS")
    print("-" * 30)
    print(f"Total Anomalies: {len(anomalies_df)}")
    print(f"Critical Anomalies: {len(anomalies_df[anomalies_df['Severity'] >= 4])}")
    print(f"Most Common Anomaly: {anomalies_df['Type'].mode().iloc[0]}")
    
    # Anomaly distribution by severity
    severity_counts = anomalies_df['Severity'].value_counts().sort_index()
    print("\nAnomaly Distribution by Severity:")
    for severity, count in severity_counts.items():
        severity_name = {1: "Low", 2: "Medium", 3: "High", 4: "Critical", 5: "Emergency"}
        print(f"  {severity_name.get(severity, 'Unknown')}: {count}")
    
    # Vehicle performance analysis
    print(f"\n⚡ PERFORMANCE METRICS")
    print("-" * 30)
    top_performer = vehicles_df.loc[vehicles_df['Avg Speed (km/h)'].idxmax()]
    print(f"Fastest Average Vehicle: {top_performer['Make Model']} ({top_performer['License Plate']}) - {top_performer['Avg Speed (km/h)']:.1f} km/h")
    
    most_distance = vehicles_df.loc[vehicles_df['Total Distance (km)'].idxmax()]
    print(f"Most Distance Traveled: {most_distance['Make Model']} ({most_distance['License Plate']}) - {most_distance['Total Distance (km)']:.1f} km")
    
    most_anomalies = vehicles_df.loc[vehicles_df['Total Anomalies'].idxmax()]
    print(f"Most Anomalies: {most_anomalies['Make Model']} ({most_anomalies['License Plate']}) - {most_anomalies['Total Anomalies']} anomalies")
    
    # Create visualizations
    create_visualizations(vehicles_df, anomalies_df)
    
    # Generate insights
    generate_insights(vehicles_df, anomalies_df)

def create_visualizations(vehicles_df, anomalies_df):
    """
    Create comprehensive visualizations of the telematics data
    """
    print(f"\n📈 GENERATING VISUALIZATIONS")
    print("-" * 30)
    
    # Set up the plotting style
    plt.style.use('seaborn-v0_8')
    fig = plt.figure(figsize=(20, 15))
    
    # 1. Vehicle State Distribution
    plt.subplot(3, 4, 1)
    state_counts = vehicles_df['State'].value_counts()
    colors = {'NORMAL': 'green', 'WARNING': 'orange', 'CRITICAL': 'red', 'OFFLINE': 'gray', 'MAINTENANCE': 'blue'}
    plt.pie(state_counts.values, labels=state_counts.index, autopct='%1.1f%%', 
            colors=[colors.get(state, 'lightblue') for state in state_counts.index])
    plt.title('Vehicle State Distribution')
    
    # 2. Speed Distribution
    plt.subplot(3, 4, 2)
    plt.hist(vehicles_df['Avg Speed (km/h)'], bins=15, alpha=0.7, color='skyblue', edgecolor='black')
    plt.xlabel('Average Speed (km/h)')
    plt.ylabel('Number of Vehicles')
    plt.title('Average Speed Distribution')
    plt.axvline(vehicles_df['Avg Speed (km/h)'].mean(), color='red', linestyle='--', label='Mean')
    plt.legend()
    
    # 3. Anomaly Severity Distribution
    plt.subplot(3, 4, 3)
    severity_counts = anomalies_df['Severity'].value_counts().sort_index()
    bars = plt.bar(severity_counts.index, severity_counts.values, 
                   color=['green', 'yellow', 'orange', 'red', 'darkred'])
    plt.xlabel('Severity Level')
    plt.ylabel('Number of Anomalies')
    plt.title('Anomaly Severity Distribution')
    plt.xticks(severity_counts.index)
    
    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}', ha='center', va='bottom')
    
    # 4. Top 10 Vehicles by Distance
    plt.subplot(3, 4, 4)
    top_distance = vehicles_df.nlargest(10, 'Total Distance (km)')
    plt.barh(range(len(top_distance)), top_distance['Total Distance (km)'])
    plt.yticks(range(len(top_distance)), 
               [f"{row['Make Model']}\n({row['License Plate']})" for _, row in top_distance.iterrows()])
    plt.xlabel('Total Distance (km)')
    plt.title('Top 10 Vehicles by Distance')
    
    # 5. Anomaly Types Distribution
    plt.subplot(3, 4, 5)
    anomaly_types = anomalies_df['Type'].value_counts().head(10)
    plt.barh(range(len(anomaly_types)), anomaly_types.values)
    plt.yticks(range(len(anomaly_types)), anomaly_types.index)
    plt.xlabel('Number of Occurrences')
    plt.title('Top 10 Anomaly Types')
    
    # 6. Current Temperature vs Speed
    plt.subplot(3, 4, 6)
    plt.scatter(vehicles_df['Current Speed'], vehicles_df['Current Temperature'], 
                alpha=0.6, c=vehicles_df['Total Anomalies'], cmap='Reds')
    plt.xlabel('Current Speed (km/h)')
    plt.ylabel('Current Temperature (°C)')
    plt.title('Speed vs Temperature')
    plt.colorbar(label='Total Anomalies')
    
    # 7. Fuel Level Distribution
    plt.subplot(3, 4, 7)
    plt.hist(vehicles_df['Current Fuel Level'], bins=15, alpha=0.7, color='gold', edgecolor='black')
    plt.xlabel('Current Fuel Level (%)')
    plt.ylabel('Number of Vehicles')
    plt.title('Current Fuel Level Distribution')
    plt.axvline(vehicles_df['Current Fuel Level'].mean(), color='red', linestyle='--', label='Mean')
    plt.legend()
    
    # 8. Harsh Events vs Total Anomalies
    plt.subplot(3, 4, 8)
    plt.scatter(vehicles_df['Harsh Events'], vehicles_df['Total Anomalies'], alpha=0.6)
    plt.xlabel('Harsh Events')
    plt.ylabel('Total Anomalies')
    plt.title('Harsh Events vs Total Anomalies')
    
    # Add correlation coefficient
    correlation = vehicles_df['Harsh Events'].corr(vehicles_df['Total Anomalies'])
    plt.text(0.05, 0.95, f'Correlation: {correlation:.3f}', transform=plt.gca().transAxes,
             bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    # 9. Vehicle Make Distribution
    plt.subplot(3, 4, 9)
    make_counts = vehicles_df['Make Model'].str.split().str[0].value_counts().head(8)
    plt.pie(make_counts.values, labels=make_counts.index, autopct='%1.1f%%')
    plt.title('Vehicle Make Distribution')
    
    # 10. RPM Distribution
    plt.subplot(3, 4, 10)
    plt.hist(vehicles_df['Current RPM'], bins=15, alpha=0.7, color='lightcoral', edgecolor='black')
    plt.xlabel('Current RPM')
    plt.ylabel('Number of Vehicles')
    plt.title('Current RPM Distribution')
    
    # 11. Anomalies by Vehicle (Top 10)
    plt.subplot(3, 4, 11)
    top_anomalies = vehicles_df.nlargest(10, 'Total Anomalies')
    plt.bar(range(len(top_anomalies)), top_anomalies['Total Anomalies'])
    plt.xticks(range(len(top_anomalies)), 
               [f"V{row['Vehicle ID']}" for _, row in top_anomalies.iterrows()], rotation=45)
    plt.xlabel('Vehicle ID')
    plt.ylabel('Total Anomalies')
    plt.title('Top 10 Vehicles by Anomalies')
    
    # 12. Geographic Distribution (if coordinates are available)
    plt.subplot(3, 4, 12)
    plt.scatter(vehicles_df['Longitude'], vehicles_df['Latitude'], 
                c=vehicles_df['Current Speed'], cmap='viridis', alpha=0.7)
    plt.xlabel('Longitude')
    plt.ylabel('Latitude')
    plt.title('Vehicle Geographic Distribution')
    plt.colorbar(label='Current Speed (km/h)')
    
    plt.tight_layout()
    plt.savefig('telematics_analysis.png', dpi=300, bbox_inches='tight')
    print("✅ Visualizations saved as 'telematics_analysis.png'")
    plt.show()

def generate_insights(vehicles_df, anomalies_df):
    """
    Generate actionable insights from the data
    """
    print(f"\n🧠 ACTIONABLE INSIGHTS")
    print("-" * 30)
    
    # Fleet efficiency insights
    avg_speed = vehicles_df['Avg Speed (km/h)'].mean()
    if avg_speed < 40:
        print("⚠️  Fleet average speed is low - consider route optimization")
    elif avg_speed > 80:
        print("⚠️  Fleet average speed is high - monitor for safety compliance")
    
    # Fuel efficiency insights
    low_fuel_vehicles = len(vehicles_df[vehicles_df['Current Fuel Level'] < 20])
    if low_fuel_vehicles > 0:
        print(f"⛽ {low_fuel_vehicles} vehicles have low fuel levels (<20%) - schedule refueling")
    
    # Maintenance insights
    high_anomaly_vehicles = vehicles_df[vehicles_df['Total Anomalies'] > vehicles_df['Total Anomalies'].quantile(0.8)]
    if len(high_anomaly_vehicles) > 0:
        print(f"🔧 {len(high_anomaly_vehicles)} vehicles have high anomaly counts - prioritize maintenance:")
        for _, vehicle in high_anomaly_vehicles.iterrows():
            print(f"   - {vehicle['Make Model']} ({vehicle['License Plate']}): {vehicle['Total Anomalies']} anomalies")
    
    # Safety insights
    critical_vehicles = vehicles_df[vehicles_df['State'] == 'CRITICAL']
    if len(critical_vehicles) > 0:
        print(f"🚨 {len(critical_vehicles)} vehicles in CRITICAL state - immediate attention required")
    
    # Performance insights
    harsh_events_threshold = vehicles_df['Harsh Events'].quantile(0.8)
    aggressive_drivers = vehicles_df[vehicles_df['Harsh Events'] > harsh_events_threshold]
    if len(aggressive_drivers) > 0:
        print(f"🚗 {len(aggressive_drivers)} vehicles show aggressive driving patterns - driver training recommended")
    
    # Anomaly pattern insights
    most_common_anomaly = anomalies_df['Type'].mode().iloc[0]
    anomaly_count = len(anomalies_df[anomalies_df['Type'] == most_common_anomaly])
    print(f"📊 Most common anomaly: {most_common_anomaly} ({anomaly_count} occurrences)")
    
    # Temperature insights
    overheating_vehicles = len(vehicles_df[vehicles_df['Current Temperature'] > 100])
    if overheating_vehicles > 0:
        print(f"🌡️  {overheating_vehicles} vehicles showing high temperatures - check cooling systems")

def export_summary_report():
    """
    Export a summary report to CSV
    """
    try:
        vehicles_df = pd.read_csv('vehicles_data_2024-01-30.csv')
        anomalies_df = pd.read_csv('anomalies_data_2024-01-30.csv')
        
        # Create summary statistics
        summary_data = {
            'Metric': [
                'Total Vehicles',
                'Active Vehicles', 
                'Critical Vehicles',
                'Average Fleet Speed (km/h)',
                'Total Fleet Distance (km)',
                'Total Anomalies',
                'Critical Anomalies',
                'Average Fuel Level (%)',
                'Vehicles Needing Maintenance'
            ],
            'Value': [
                len(vehicles_df),
                len(vehicles_df[vehicles_df['State'] != 'OFFLINE']),
                len(vehicles_df[vehicles_df['State'] == 'CRITICAL']),
                round(vehicles_df['Avg Speed (km/h)'].mean(), 2),
                round(vehicles_df['Total Distance (km)'].sum(), 2),
                len(anomalies_df),
                len(anomalies_df[anomalies_df['Severity'] >= 4]),
                round(vehicles_df['Current Fuel Level'].mean(), 2),
                len(vehicles_df[vehicles_df['Total Anomalies'] > vehicles_df['Total Anomalies'].quantile(0.8)])
            ]
        }
        
        summary_df = pd.DataFrame(summary_data)
        summary_df.to_csv('telematics_summary_report.csv', index=False)
        print("✅ Summary report exported as 'telematics_summary_report.csv'")
        
    except Exception as e:
        print(f"❌ Error creating summary report: {e}")

if __name__ == "__main__":
    # Run the analysis
    load_and_analyze_telematics_data()
    
    # Export summary report
    export_summary_report()
    
    print(f"\n🎉 Analysis complete! Check the generated files:")
    print("   - telematics_analysis.png (visualizations)")
    print("   - telematics_summary_report.csv (summary statistics)")
