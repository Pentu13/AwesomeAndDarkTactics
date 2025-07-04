---
layout: tactic
title: "Awesome Tactic Template"                # [REQUIRED] Short, descriptive name for the tactic
tags: 
  - template
t-sort: "Awesome Tactic" # [REQUIRED] Should be "Awesome Tactic"
t-type: "Template"       # [REQUIRED] E.g., Architectural Tactic, Software Practice
categories: 
  - templates            # [REQUIRED] List of categories, e.g., [templates]
t-description: "This is a template for creating Awesome Tactics. Replace this description with what your tactic does."        # [REQUIRED] What does this tactic do?
t-participant: "Template User"        # [REQUIRED] Who applies this tactic?
t-artifact: "Template Artifact"           # [REQUIRED] What artifact does this tactic apply to?
t-context: "Template Context"            # [REQUIRED] Where/when is this tactic applied?
t-feature: "Template Feature"            # [REQUIRED] What feature of the artifact?
t-intent: "Template Intent"             # [REQUIRED] What is the goal of this tactic?
t-targetQA: "<Unavailable>"           # [OPTIONAL] Target quality attribute
t-relatedQA: "<Unavailable>"          # [OPTIONAL] Other related quality attributes
t-measuredimpact: "<Unavailable>"     # [OPTIONAL] Measured impact
t-source: "Template Source"             # [REQUIRED] Reference or source
t-source-doi: "<Unavailable>"         # [OPTIONAL] DOI or URL for the source
t-diagram: "<Unavailable>" # [OPTIONAL] Diagram filename or <Unavailable>
t-intentmeasure: "<Unavailable>" # [OPTIONAL] How is the intent measured?
t-countermeasure: "<Unavailable>" # [OPTIONAL] How to counter this tactic?
---

## How to Use This Template

This is a template for creating **Awesome Tactics**. To use this template:

1. **Copy this file** and rename it to follow the naming convention: `YYYY-MM-DD-your-tactic-name.md`
2. **Replace all placeholder values** with your actual tactic information
3. **Remove the comments** (text after `#`) once you've filled in the fields
4. **Add your tactic content** below this section if needed

### Required Fields
- `title`: A short, descriptive name for your tactic
- `t-sort`: Must be "Awesome Tactic" 
- `t-type`: The type of tactic (e.g., "Architectural Tactic", "Software Practice")
- `categories`: List of categories your tactic belongs to
- `t-description`: Detailed description of what your tactic does
- `t-participant`: Who applies this tactic
- `t-artifact`: What artifact the tactic applies to
- `t-context`: Where/when the tactic is applied
- `t-feature`: What feature of the artifact
- `t-intent`: The goal of this tactic
- `t-source`: Reference or source for this tactic

### Optional Fields
- `tags`: List of relevant tags
- `t-targetQA`: Target quality attribute
- `t-relatedQA`: Other related quality attributes
- `t-measuredimpact`: Measured impact
- `t-source-doi`: DOI or URL for the source
- `t-diagram`: Diagram filename or "<Unavailable>"
- `t-intentmeasure`: How the intent is measured
- `t-countermeasure`: How to counter this tactic (usually "<Unavailable>" for Awesome Tactics)