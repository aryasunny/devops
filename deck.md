---
theme: default
class: lead
paginate: true
transition: fade
---

# Event-Driven Monitoring & DevOps Automation

### _AWS CDK + GitHub Actions + Shift-Left Observability_

---

## 🏗️ System Overview

> Event flow: API → Lambda → DynamoDB → EventBridge → SES → SQS (+ DLQ)

## ![System Design](images/system-design.png)

---

## 📡 Monitoring & Observability

<!-- _class: smaller -->
<div style="font-size:0.55em;">

| **Component** | **What to Monitor**        | **Failure Indicators**          | **Detection / Metric**                                     | **Alert Trigger**                  | **Resolution**                                       |
| ------------- | -------------------------- | ------------------------------- | ---------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------- |
| API / Lambda  | Request failures / latency | 5XX, throttles, errors          | CloudWatch `Errors`, `Throttles`, `Latency` (p95)          | >1% 5XX in 5m or >3 errors         | Inspect logs; rollback/fix config; raise concurrency |
| EventBridge   | Delivery to targets        | `FailedInvocations`             | CloudWatch metric `FailedInvocations`; DLQ depth           | >0 failures or DLQ >0              | Fix target IAM/endpoint; redrive DLQ                 |
| Email Lambda  | Send processing            | SES API errors, timeouts        | Lambda `Errors`, `Duration`; custom `emailSendFailures`    | >0 errors                          | Tune retries; handle throttling; fix code            |
| SES           | Reputation / quota         | Bounce↑, Complaint↑, Throttled  | SES `Reputation.BounceRate`, `ComplaintRate`, `Reject`     | >2% / >0.1% or Throttled>0         | Clean list; slow rate; request quota                 |
| DynamoDB      | Persistence & status       | Throttled writes; stuck PENDING | `ThrottledRequests`; custom “pending_age”                  | Throttled>0 or pending>N for X min | On-demand/RCU+; reprocess stale                      |
| SQS (Status)  | Backlog & failures         | Visible↑; DLQ↑; oldest age↑     | `ApproximateNumberOfMessagesVisible`, `AgeOfOldestMessage` | Visible>100 or DLQ>0               | Scale consumers; redrive DLQ                         |

</div>

---

## 📈 Success Metrics

<!-- _class: smaller -->
<div style="font-size:0.55em;">

| **KPI**             | **Definition**                    | **Purpose**           | **Target** |
| ------------------- | --------------------------------- | --------------------- | ---------- |
| Email Success Rate  | `(sent / total) × 100`            | Overall reliability   | ≥ 98%      |
| Avg Processing Time | `sentTime − requestTime`          | E2E performance       | < 5 s      |
| Bounce Rate         | SES metric                        | Deliverability health | < 2%       |
| Complaint Rate      | SES metric                        | User experience       | < 0.1%     |
| Pending Requests    | `count(status='PENDING') / total` | Flow health           | < 2%       |
| DLQ Messages        | DLQ depth                         | Reliability           | 0          |

</div>

---

## 🧩 Dev & Deploy of Monitoring (AWS CDK + GitHub Actions)

- Define **CloudWatch alarms, dashboards, log metrics, SNS topics** in **CDK** (IaC).
- Ship them via **GitHub Actions** to every env (preview → deploy → verify).
- Observability changes are **version-controlled**, reviewed, and promoted like app code.
- Engineers own **dashboards + alarms** from day one (shift-left).

<div style="margin-top:1.2rem;">
  <a href="./code/cdk-monitoring.html" style="padding:10px 16px;border:1px solid #444;border-radius:8px;text-decoration:none;">View CDK code</a>
  &nbsp;&nbsp;
  <a href="./code/gha-monitoring.html" style="padding:10px 16px;border:1px solid #444;border-radius:8px;text-decoration:none;">View GitHub Actions workflow</a>
</div>
