# Adding New Metrics to AlphaGameBot

This guide explains how to add new metrics to the AlphaGameBot metrics system.

## Overview

The metrics system has been designed to be scalable and easy to extend. Adding a new metric now requires changes in only 2 places instead of 5+.

## Steps to Add a New Metric

### 1. Define the Metric Type in the Metrics Enum

First, add your new metric to the `Metrics` enum in `src/services/metrics/metrics.ts`:

```typescript
export enum Metrics {
    // ... existing metrics ...
    MY_NEW_METRIC = "my_new_metric"
}
```

### 2. Add the Data Shape to MetricDataMap

Define the data structure for your metric in `src/interfaces/metrics/MetricDataMap.ts`:

```typescript
export interface MetricDataMap {
    // ... existing metrics ...
    [Metrics.MY_NEW_METRIC]: {
        field1: string,
        field2: number
    }
}
```

### 3. Add the Metric Configuration

Add a configuration object to the `metricConfigurations` array in `src/services/metrics/definitions/metricConfigurations.ts`:

```typescript
{
    name: Metrics.MY_NEW_METRIC,
    description: "Description of what this metric tracks",
    prometheusType: PrometheusMetricType.GAUGE, // or COUNTER or HISTOGRAM
    prometheusName: "alphagamebot_my_new_metric",
    prometheusHelp: "Help text for Prometheus",
    prometheusLabels: ["label1", "label2"], // Optional labels
    processData: (metric, data) => {
        const typedData = data as MetricDataMap[Metrics.MY_NEW_METRIC];
        (metric as Gauge).inc({ 
            label1: String(typedData.field1),
            label2: String(typedData.field2)
        });
    }
}
```

**That's it!** The metric will be automatically:
- Registered with the metric registry
- Created as a Prometheus metric (Gauge/Counter/Histogram)
- Registered with the Prometheus registry
- Processed during metrics export

## Metric Configuration Options

### `prometheusType`

Choose the appropriate Prometheus metric type:

- **`GAUGE`**: For values that can go up and down (e.g., queue length, latency)
- **`COUNTER`**: For values that only increase (e.g., request count, error count)
- **`HISTOGRAM`**: For distributions (e.g., request duration, database query time)

### `prometheusLabels`

Labels allow you to add dimensions to your metrics. For example, a request counter might have labels for `method` and `status_code`.

### `prometheusBuckets` (Histogram only)

For histogram metrics, you can define custom buckets:

```typescript
prometheusBuckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
```

### `processData`

This function determines how the metric data is processed and recorded in Prometheus:

- **Gauge**: Use `.set()` to set a value, `.inc()` to increment
- **Counter**: Use `.inc()` to increment
- **Histogram**: Use `.observe()` to record an observation

## Using Your Metric

Once defined, submit metrics using the existing API:

```typescript
import { metricsManager, Metrics } from "./services/metrics/metrics.js";

metricsManager.submitMetric<Metrics.MY_NEW_METRIC>(Metrics.MY_NEW_METRIC, {
    field1: "value1",
    field2: 42
});
```

## Benefits of the New System

1. **Centralized Configuration**: All metric definitions in one place
2. **Type Safety**: TypeScript ensures data matches expected shape
3. **Self-Documenting**: Configuration includes description and help text
4. **No Boilerplate**: No need to update multiple switch statements
5. **Easier Maintenance**: Changes to metric handling only in configuration
6. **Automatic Registration**: Metrics auto-register with Prometheus

## Example: Adding a Cache Hit/Miss Metric

### Step 1: Add to Metrics enum

```typescript
export enum Metrics {
    // ...
    CACHE_ACCESS = "cache_access"
}
```

### Step 2: Add to MetricDataMap

```typescript
export interface MetricDataMap {
    // ...
    [Metrics.CACHE_ACCESS]: {
        cacheKey: string,
        hit: boolean
    }
}
```

### Step 3: Add configuration

```typescript
{
    name: Metrics.CACHE_ACCESS,
    description: "Cache access hits and misses",
    prometheusType: PrometheusMetricType.COUNTER,
    prometheusName: "alphagamebot_cache_access_total",
    prometheusHelp: "Total number of cache accesses",
    prometheusLabels: ["cache_key", "result"],
    processData: (metric, data) => {
        const typedData = data as MetricDataMap[Metrics.CACHE_ACCESS];
        (metric as Counter).inc({ 
            cache_key: String(typedData.cacheKey),
            result: typedData.hit ? "hit" : "miss"
        });
    }
}
```

### Step 4: Use it

```typescript
metricsManager.submitMetric<Metrics.CACHE_ACCESS>(Metrics.CACHE_ACCESS, {
    cacheKey: "user:123",
    hit: true
});
```
