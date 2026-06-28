publish(
  'stg_yellow_trip',
  {
    schema: 'staging',
    type: 'incremental',
    uniqueKey: ['trip_id'],
    partitionBy: 'DATE(pickup_datetime)',
    description: 'NYC yellow taxi trip data - cleaned staging layer',
    columns: {
      trip_id: 'Signify of 1 yellow taxi trip',
      vendor_id: 'The Trip Record Data Program(TPEP) provider id',
      pickup_datetime: 'When the meter was engaged',
      dropoff_datetime: 'When the meter was disengaged',
      passenger_count: 'The number of passengers in the vehicle',
      trip_distance: 'The elapsed trip distance in miles',
      rate_code_id: 'The final rate code in effect at the end of the trip',
      store_and_forward_flag: 'Store and forward trip or not',
      pickup_location_id: 'TLC taxi zone in which the taximeter was engaged',
      dropoff_location_id: 'TLC taxi zone in which the taximeter was disengaged',
      payment_type: 'A numeric code signifying how the passenger paid for the trip',
      fare_amount: 'The time-and-distance fare calculated by the meter',
      extras_and_surcharges: 'Miscellaneous extras and surcharges',
      metered_rate_tax: 'Tax that is automatically triggered based on the metered rate in use',
      tip_amount: 'Automatically populated for credit card tips',
      tolls_amount: 'Total amount of all tolls paid in trip',
      improvement_surcharge: 'Improvement surcharge assessed trips at the flag drop',
      total_amount: 'The total amount charged to passengers',
      congestion_surcharge: 'Total amount collected in trip for NYS congestion surcharge',
      airport_fee: 'For pick up only at LaGuardia and John F. Kennedy Airports',
      cbd_congestion_fee: 'Per-trip charge for MTA Congestion Relief Zone'
    }
  }
).query(ctx => {

  const project = 'nyc-taxi-dwh-487606';

  const tablesQuery = `
    SELECT table_name
    FROM \`${project}.raw.INFORMATION_SCHEMA.TABLES\`
    WHERE table_name LIKE 'ext_%'
    ORDER BY table_name
  `;

  // 欠年月があるので、記載方式とする
  const tables = [
    'ext_2021_01',
    'ext_2021_02',
  ];

  const queries = [];

  tables.forEach(table => {
    queries.push(`
      SELECT
        CONCAT(
          REGEXP_EXTRACT(_FILE_NAME, r'(\\d{4}-\\d{2})'), '_',
          CAST(
            ROW_NUMBER() OVER(
              PARTITION BY _FILE_NAME
              ORDER BY tpep_pickup_datetime,
                       tpep_dropoff_datetime,
                       VendorID,
                       PULocationID,
                       DOLocationID
            ) AS STRING
          )
        ) AS trip_id,
        CAST(VendorID AS INT64) AS vendor_id,
        CAST(tpep_pickup_datetime AS TIMESTAMP) AS pickup_datetime,
        CAST(tpep_dropoff_datetime AS TIMESTAMP) AS dropoff_datetime,
        CAST(passenger_count AS INT64) AS passenger_count,
        CAST(trip_distance AS FLOAT64) AS trip_distance,
        CAST(RatecodeID AS INT64) AS rate_code_id,
        CAST(store_and_fwd_flag AS STRING) AS store_and_forward_flag,
        CAST(PULocationID AS INT64) AS pickup_location_id,
        CAST(DOLocationID AS INT64) AS dropoff_location_id,
        CAST(payment_type AS INT64) AS payment_type,
        CAST(fare_amount AS FLOAT64) AS fare_amount,
        CAST(extra AS FLOAT64) AS extras_and_surcharges,
        CAST(mta_tax AS FLOAT64) AS metered_rate_tax,
        CAST(tip_amount AS FLOAT64) AS tip_amount,
        CAST(tolls_amount AS FLOAT64) AS tolls_amount,
        CAST(improvement_surcharge AS FLOAT64) AS improvement_surcharge,
        CAST(total_amount AS FLOAT64) AS total_amount,
        CAST(congestion_surcharge AS FLOAT64) AS congestion_surcharge,
        CAST(airport_fee AS FLOAT64) AS airport_fee,
        ${table >= 'ext_2025_01'
          ? 'CAST(cbd_congestion_fee AS FLOAT64)'
          : 'CAST(NULL AS FLOAT64)'
        } AS cbd_congestion_fee
      FROM ${ctx.ref(table)}
    `);
  });

  return queries.join('\nUNION ALL\n');

});