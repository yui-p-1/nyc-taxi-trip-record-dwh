const years = [2021, 2022, 2023, 2024, 2025];
years.forEach(year => {
  for (let m = 1; m <= 12; m++) {
    const month = String(m).padStart(2, "0");
    declare({
      database: "nyc-taxi-dwh-487606",
      schema: "raw",
      name: `ext_${year}_${month}`
    });
  }
});

declare({
  database: 'nyc-taxi-dwh-487606',
  schema: 'raw',
  name: 'lookup_nyc_taxi_zones'
});
declare({
  database: 'nyc-taxi-dwh-487606',
  schema: 'raw',
  name: 'lookup_taxi_zone_lookup'
});
