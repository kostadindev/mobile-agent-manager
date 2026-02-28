"""
MobileAgents Survey Analysis
Reads results/survey.csv, computes descriptive stats, and patches only the
numeric table rows in report.tex. All prose is left untouched.
"""

import csv, re, statistics, collections, math
from pathlib import Path
from scipy import stats as sp

ROOT = Path(__file__).parent.parent
CSV  = Path(__file__).parent / "survey.csv"
TEX  = ROOT / "report.tex"

# ── load ───────────────────────────────────────────────────────────────────
with open(CSV, newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))
N = len(rows)
print(f"Loaded {N} responses\n")

# ── helpers ────────────────────────────────────────────────────────────────
def nums(col):
    out = []
    for r in rows:
        try: out.append(float(r.get(col, "").strip()))
        except ValueError: pass
    return out

def ms(col):
    """Return (mean, population_sd, sample_sd, median, ci_low, ci_high, n, vals)."""
    v = nums(col)
    if not v:
        return 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0, v
    m   = statistics.mean(v)
    psd = statistics.pstdev(v)
    ssd = statistics.stdev(v) if len(v) > 1 else 0.0
    med = statistics.median(v)
    # 95% t-based CI
    sem = ssd / math.sqrt(len(v))
    t_crit = sp.t.ppf(0.975, df=len(v) - 1) if len(v) > 1 else 0.0
    ci_lo, ci_hi = m - t_crit * sem, m + t_crit * sem
    return m, psd, ssd, med, ci_lo, ci_hi, len(v), v

def fmt(m, s): return f"{m:.1f} ({s:.1f})"
def fmt_ci(lo, hi): return f"[{lo:.1f}, {hi:.1f}]"

def freq(col):
    return collections.Counter(
        r.get(col, "").strip() for r in rows if r.get(col, "").strip()
    )

# ── RQ1: transparency ──────────────────────────────────────────────────────
TRANS = {
    "Trust":        "I trusted the system's output enough to act on it.",
    "Control":      "I felt in control of what the system did on my behalf.",
    "Satisfaction": "I am satisfied with this interaction.",
    "Expect":       "The system made it clear what it was going to do before doing it.",
    "Repair":       "It was easy to correct or stop the system when needed.",
    "Explain":      "I understood why the system made the decisions it did.",
    "Privacy":      "I felt comfortable with the information I shared during this task.",
}

rq1 = {}
for label, base in TRANS.items():
    rq1[label] = {
        "C1": ms(base),
        "C2": ms(base + " 2"),
        "C3": ms(base + " 3"),
    }

# Friedman test for each RQ1 metric (within-subjects, 3 conditions)
print("── RQ1: Transparency modes ──")
print(f"  {'Metric':<14} {'C1 M(SD) [95%CI]':<28} {'C2':<28} {'C3':<28} {'Friedman'}")
for label, d in rq1.items():
    m1,p1,s1,med1,lo1,hi1,n1,v1 = d["C1"]
    m2,p2,s2,med2,lo2,hi2,n2,v2 = d["C2"]
    m3,p3,s3,med3,lo3,hi3,n3,v3 = d["C3"]
    # align lengths for Friedman (drop rows with missing data in any condition)
    triples = [(a,b,c) for a,b,c in zip(v1,v2,v3)]
    if len(triples) >= 3:
        a,b,c = zip(*triples)
        stat, p = sp.friedmanchisquare(a, b, c)
        fr_str = f"χ²={stat:.2f}, p={p:.3f}"
    else:
        fr_str = "n/a"
    c1_str = f"{m1:.1f} ({s1:.1f}) {fmt_ci(lo1,hi1)}"
    c2_str = f"{m2:.1f} ({s2:.1f}) {fmt_ci(lo2,hi2)}"
    c3_str = f"{m3:.1f} ({s3:.1f}) {fmt_ci(lo3,hi3)}"
    print(f"  {label:<14} {c1_str:<28} {c2_str:<28} {c3_str:<28} {fr_str}")

# ── RQ2: modalities ────────────────────────────────────────────────────────
NASA_DIMS = [
    "Mental Demand — How much mental and perceptual activity was required?",
    "Physical Demand — How much physical activity was required?",
    "Temporal Demand — How much time pressure did you feel?",
    "Performance — How successful were you in accomplishing the task?",
    "Effort — How hard did you have to work to accomplish the task?",
    "Frustration — How irritated, stressed, or annoyed did you feel?",
]
NASA_SHORT = ["Mental", "Physical", "Temporal", "Performance", "Effort", "Frustration"]

SEQ_COLS    = ["Overall, how would you rate the difficulty of this task?",
               "Overall, how would you rate the difficulty of this task? 2",
               "Overall, how would you rate the difficulty of this task? 3"]
COMFORT_COLS = [
    ("Using text input felt natural for this type of task.",  "I would use text input in a public/shared space."),
    ("Using image input felt natural for this type of task.", "I would use image input in a public/shared space."),
    ("Using voice input felt natural for this type of task.", "I would use voice input in a public/shared space."),
]

rq2 = {}
for i, mod in enumerate(["text", "image", "voice"]):
    suf = "" if i == 0 else f" {i+1}"
    rq2[mod] = {}
    rq2[mod]["SEQ"]     = ms(SEQ_COLS[i])
    rq2[mod]["natural"] = ms(COMFORT_COLS[i][0])
    rq2[mod]["public"]  = ms(COMFORT_COLS[i][1])
    for dim in NASA_DIMS:
        rq2[mod][dim] = ms(dim if i == 0 else dim + f" {i+1}")
    # composite TLX per participant then aggregate
    per_p = []
    for r in rows:
        v = []
        for dim in NASA_DIMS:
            try: v.append(float(r.get(dim if i == 0 else dim + f" {i+1}", "").strip()))
            except ValueError: pass
        if v: per_p.append(statistics.mean(v))
    if per_p:
        m_tlx = statistics.mean(per_p)
        ps_tlx = statistics.pstdev(per_p)
        s_tlx  = statistics.stdev(per_p) if len(per_p) > 1 else 0.0
        med_tlx = statistics.median(per_p)
        sem_tlx = s_tlx / math.sqrt(len(per_p))
        tc = sp.t.ppf(0.975, df=len(per_p)-1) if len(per_p) > 1 else 0.0
        rq2[mod]["TLX"] = (m_tlx, ps_tlx, s_tlx, med_tlx,
                           m_tlx - tc*sem_tlx, m_tlx + tc*sem_tlx, len(per_p), per_p)
    else:
        rq2[mod]["TLX"] = (0,0,0,0,0,0,0,[])

print("\n── RQ2: Modalities ──")
print(f"  {'Metric':<16} {'Text M(SD) [95%CI]':<30} {'Image':<30} {'Voice':<30} {'Friedman'}")
for key, label in [("SEQ","SEQ"), ("TLX","TLX composite")]:
    rows_by_mod = [rq2[m][key] for m in ["text","image","voice"]]
    triples = [(a,b,c) for a,b,c in zip(rows_by_mod[0][7], rows_by_mod[1][7], rows_by_mod[2][7])]
    if len(triples) >= 3:
        a,b,c = zip(*triples)
        stat, p = sp.friedmanchisquare(a, b, c)
        fr_str = f"χ²={stat:.2f}, p={p:.3f}"
    else:
        fr_str = "n/a"
    parts = []
    for d in rows_by_mod:
        m,ps,s,med,lo,hi,n,v = d
        parts.append(f"{m:.1f} ({s:.1f}) {fmt_ci(lo,hi)}")
    print(f"  {label:<16} {parts[0]:<30} {parts[1]:<30} {parts[2]:<30} {fr_str}")

# ── RQ3: customisation ─────────────────────────────────────────────────────
RQ3 = {
    "Discoverability": "I was able to find the constitution editor without help.",
    "Mental Model":    "I understood what the constitution field does.",
    "Effectiveness":   "Editing the constitution changed the system's behaviour as I expected.",
    "Controllability": "The agent on/off toggles were easy to understand and use.",
    "Ownership":       "After customising the system, I felt more in control.",
    "Adoption":        "I would use the constitution and agent controls regularly.",
}
rq3 = {k: ms(v) for k, v in RQ3.items()}

print("\n── RQ3: Customisation ──")
for k, v in rq3.items():
    m,ps,s,med,lo,hi,n,_ = v
    print(f"  {k:<18} M={m:.1f} SD={s:.1f} Mdn={med:.1f} 95%CI {fmt_ci(lo,hi)}")

# ── Overall ────────────────────────────────────────────────────────────────
overall = {
    "Overall Trust":   ms("Overall, I would trust this system to act on my behalf on a mobile device."),
    "Privacy":         ms("I felt this system respected my privacy."),
    "Adoption Intent": ms("I would use this application in my day-to-day work."),
}
print("\n── Overall ──")
for k, v in overall.items():
    m,ps,s,med,lo,hi,n,_ = v
    print(f"  {k:<18} M={m:.1f} SD={s:.1f} Mdn={med:.1f} 95%CI {fmt_ci(lo,hi)}")

# ── post-hoc pairwise tests ────────────────────────────────────────────────
N_PAIRS = 3   # C1-C2, C1-C3, C2-C3

def cohens_d(a, b):
    diffs = [x - y for x, y in zip(a, b)]
    if len(diffs) < 2: return 0.0
    return statistics.mean(diffs) / statistics.stdev(diffs)

def pairwise(va, vb, label_a, label_b):
    """Wilcoxon signed-rank + Bonferroni-corrected p + Cohen's d."""
    pairs = [(a, b) for a, b in zip(va, vb) if a != b]
    if len(pairs) < 3:
        return {"pair": f"{label_a}-{label_b}", "W": None, "p_raw": None,
                "p_bon": None, "d": None, "sig": False}
    a, b = zip(*pairs)
    W, p_raw = sp.wilcoxon(a, b)
    p_bon = min(p_raw * N_PAIRS, 1.0)
    d = cohens_d(list(va), list(vb))
    return {"pair": f"{label_a}-{label_b}", "W": round(W,1), "p_raw": round(p_raw,3),
            "p_bon": round(p_bon,3), "d": round(d,2), "sig": p_bon < 0.05}

# Run for every RQ1 metric
posthoc_rq1 = {}
PAIRS_RQ1 = [("C1","C2"), ("C1","C3"), ("C2","C3")]
print("\n── RQ1 Post-hoc (Wilcoxon, Bonferroni-corrected, Cohen's d) ──")
print(f"  {'Metric':<14} {'Pair':<8} {'W':>6} {'p_raw':>7} {'p_bon':>7} {'d':>6} {'sig':>4}")
for label, d in rq1.items():
    posthoc_rq1[label] = []
    for ca, cb in PAIRS_RQ1:
        r = pairwise(d[ca][7], d[cb][7], ca, cb)
        posthoc_rq1[label].append(r)
        sig_str = "*" if r["sig"] else ""
        print(f"  {label:<14} {r['pair']:<8} {str(r['W']):>6} {str(r['p_raw']):>7} "
              f"{str(r['p_bon']):>7} {str(r['d']):>6} {sig_str:>4}")

# Run for RQ2 SEQ and TLX
MODS = ["text","image","voice"]
PAIRS_RQ2 = [("text","image"), ("text","voice"), ("image","voice")]
posthoc_rq2 = {}
print("\n── RQ2 Post-hoc (Wilcoxon, Bonferroni-corrected, Cohen's d) ──")
print(f"  {'Metric':<14} {'Pair':<14} {'W':>6} {'p_raw':>7} {'p_bon':>7} {'d':>6} {'sig':>4}")
for key in ["SEQ", "TLX"]:
    posthoc_rq2[key] = []
    for ma, mb in PAIRS_RQ2:
        r = pairwise(rq2[ma][key][7], rq2[mb][key][7], ma, mb)
        posthoc_rq2[key].append(r)
        sig_str = "*" if r["sig"] else ""
        print(f"  {key:<14} {r['pair']:<14} {str(r['W']):>6} {str(r['p_raw']):>7} "
              f"{str(r['p_bon']):>7} {str(r['d']):>6} {sig_str:>4}")

# RQ3: one-sample Wilcoxon vs midpoint 4 (is each item significantly above/below neutral?)
print("\n── RQ3 one-sample Wilcoxon vs midpoint 4 ──")
print(f"  {'Item':<18} {'W':>6} {'p':>7} {'sig':>4}")
posthoc_rq3 = {}
for k, v in rq3.items():
    vals = v[7]
    diffs = [x - 4 for x in vals if x != 4]
    if len(diffs) >= 3:
        W, p = sp.wilcoxon(diffs)
        sig_str = "*" if p < 0.05 else ""
        posthoc_rq3[k] = {"W": round(W,1), "p": round(p,3), "sig": p < 0.05}
        print(f"  {k:<18} {W:>6.1f} {p:>7.3f} {sig_str:>4}")
    else:
        posthoc_rq3[k] = {"W": None, "p": None, "sig": False}

top_feature   = freq("Which single feature contributed most to your trust in the system?")
friction_feat = freq("Which single feature caused the most friction or concern?")
pref_everyday = freq("Which transparency mode would you prefer for everyday use?")
pref_highstakes = freq("Which mode would you prefer for high-stakes tasks (e.g., sending a Slack message on your behalf)?")
mod_pref      = freq("Which input modality would you use most often on a mobile device?")

# ── build table row strings ────────────────────────────────────────────────
def msd(t): return t[0], t[1]   # mean, pop-sd from 8-tuple (used for table fmt)

def row3(label, c1, c2, c3):
    return f"    {label:<20} & {fmt(*msd(c1))} & {fmt(*msd(c2))} & {fmt(*msd(c3))} \\\\"

def row2(label, val):
    return f"    {label:<20} & {fmt(*msd(val))} \\\\"

# Table: RQ1 primary
tab_rq1_primary = "\n".join(
    row3(k, rq1[k]["C1"], rq1[k]["C2"], rq1[k]["C3"])
    for k in ["Trust", "Control", "Satisfaction"]
)

# Table: RQ1 supplementary
SUPP_LABELS = {"Expect":"Expect. Setting","Repair":"Repairability",
               "Explain":"Explainability","Privacy":"Privacy Comfort"}
tab_rq1_supp = "\n".join(
    row3(SUPP_LABELS[k], rq1[k]["C1"], rq1[k]["C2"], rq1[k]["C3"])
    for k in ["Expect", "Repair", "Explain", "Privacy"]
)

# Table: RQ2
def r3(label, key):
    return row3(label, rq2["text"][key], rq2["image"][key], rq2["voice"][key])

tab_rq2 = "\n".join([
    r3("SEQ (ease, 1--7)", "SEQ"),
    r3("TLX composite",    "TLX"),
] + [
    row3(f"~~{NASA_SHORT[i]}", rq2["text"][NASA_DIMS[i]], rq2["image"][NASA_DIMS[i]], rq2["voice"][NASA_DIMS[i]])
    for i in range(6)
] + [
    r3("Felt natural (1--7)", "natural"),
    r3("OK in public (1--7)", "public"),
])

# Table: RQ3
tab_rq3 = "\n".join(row2(k, v) for k, v in rq3.items())

# ── patch tables in report.tex ─────────────────────────────────────────────
def patch_table(tex, label, new_rows):
    r"""Replace content between \midrule and \bottomrule in a table with label."""
    pattern = (
        r"(\\label\{" + re.escape(label) + r"\}.*?\\midrule\n)"
        r"(.*?)"
        r"(    \\bottomrule)"
    )
    def repl(m):
        return m.group(1) + new_rows + "\n" + m.group(3)
    new_tex, n = re.subn(pattern, repl, tex, count=1, flags=re.DOTALL)
    if n == 0:
        print(f"WARNING: table {label} not found")
    return new_tex

# ── save results to CSV ────────────────────────────────────────────────────
import csv as csv_mod

out_rows = []

def csv_row(section, metric, condition, t):
    m, _, s, med, lo, hi, n, _ = t
    return {"section": section, "metric": metric, "condition": condition,
            "n": n, "mean": round(m,2), "sd": round(s,2), "median": round(med,2),
            "ci95_lo": round(lo,2), "ci95_hi": round(hi,2)}

for label, d in rq1.items():
    for config in ["C1", "C2", "C3"]:
        out_rows.append(csv_row("RQ1", label, config, d[config]))

for mod in ["text", "image", "voice"]:
    out_rows.append(csv_row("RQ2", "SEQ", mod, rq2[mod]["SEQ"]))
    out_rows.append(csv_row("RQ2", "TLX_composite", mod, rq2[mod]["TLX"]))
    for dim, short in zip(NASA_DIMS, NASA_SHORT):
        out_rows.append(csv_row("RQ2", f"TLX_{short}", mod, rq2[mod][dim]))
    for key in ["natural", "public"]:
        out_rows.append(csv_row("RQ2", key, mod, rq2[mod][key]))

for k, v in rq3.items():
    out_rows.append(csv_row("RQ3", k, "—", v))

for k, v in overall.items():
    out_rows.append(csv_row("Overall", k, "—", v))

# post-hoc rows
ph_rows = []
for metric, tests in posthoc_rq1.items():
    for t in tests:
        ph_rows.append({"section":"RQ1_posthoc","metric":metric,"pair":t["pair"],
                        "W":t["W"],"p_raw":t["p_raw"],"p_bon":t["p_bon"],
                        "cohens_d":t["d"],"sig":t["sig"]})
for key, tests in posthoc_rq2.items():
    for t in tests:
        ph_rows.append({"section":"RQ2_posthoc","metric":key,"pair":t["pair"],
                        "W":t["W"],"p_raw":t["p_raw"],"p_bon":t["p_bon"],
                        "cohens_d":t["d"],"sig":t["sig"]})
for k, t in posthoc_rq3.items():
    ph_rows.append({"section":"RQ3_posthoc","metric":k,"pair":"vs_4",
                    "W":t["W"],"p_raw":t["p"],"p_bon":t["p"],"cohens_d":None,"sig":t["sig"]})

PH_CSV = Path(__file__).parent / "posthoc_tests.csv"
with open(PH_CSV, "w", newline="", encoding="utf-8") as f:
    writer = csv_mod.DictWriter(f, fieldnames=["section","metric","pair","W","p_raw","p_bon","cohens_d","sig"])
    writer.writeheader()
    writer.writerows(ph_rows)
print(f"Post-hoc results saved to {PH_CSV}")

OUT_CSV = Path(__file__).parent / "results_summary.csv"
with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
    writer = csv_mod.DictWriter(f, fieldnames=["section","metric","condition","n","mean","sd","median","ci95_lo","ci95_hi"])
    writer.writeheader()
    writer.writerows(out_rows)
print(f"Results saved to {OUT_CSV}\n")

# Build post-hoc LaTeX table (primary metrics only: Trust, Control, Satisfaction)
PRIMARY = ["Trust", "Control", "Satisfaction"]
ph_tex_rows = []
for metric in PRIMARY:
    for t in posthoc_rq1[metric]:
        p_str = f"{t['p_bon']:.3f}" if t["p_bon"] is not None else "—"
        d_str = f"{t['d']:.2f}"    if t["d"]   is not None else "—"
        sig_marker = "$^*$" if t["sig"] else ""
        ph_tex_rows.append(
            f"    {metric:<14} & {t['pair']:<8} & {str(t['W']):<6} & {p_str}{sig_marker} & {d_str} \\\\"
        )
tab_posthoc = "\n".join(ph_tex_rows)

posthoc_table_tex = r"""
\begin{table}[h]
  \caption{Post-hoc pairwise Wilcoxon signed-rank tests (Bonferroni-corrected, $k=3$) and Cohen's $d$ for primary RQ1 metrics. $^*p_{\mathrm{bon}}<.05$.}
  \label{tab:posthoc-rq1}
  \small
  \begin{tabular}{p{0.18\columnwidth} p{0.10\columnwidth} p{0.08\columnwidth} p{0.12\columnwidth} p{0.08\columnwidth}}
    \toprule
    Metric & Pair & $W$ & $p_{\mathrm{bon}}$ & $d$ \\
    \midrule
""" + tab_posthoc + r"""
    \bottomrule
  \end{tabular}
\end{table}
"""

tex = TEX.read_text(encoding="utf-8")
tex = patch_table(tex, "tab:results",          tab_rq1_primary)
tex = patch_table(tex, "tab:results-supp",     tab_rq1_supp)
tex = patch_table(tex, "tab:results-modality", tab_rq2)
tex = patch_table(tex, "tab:results-rq3",      tab_rq3)

# Insert post-hoc table after tab:results-supp if not already present
if "tab:posthoc-rq1" not in tex:
    tex = tex.replace(
        r"\begin{table}[h]" + "\n" + r"  \caption{Mean (SD) SEQ",
        posthoc_table_tex + r"\begin{table}[h]" + "\n" + r"  \caption{Mean (SD) SEQ"
    )

TEX.write_text(tex, encoding="utf-8")
print("\nTables patched in report.tex.")
