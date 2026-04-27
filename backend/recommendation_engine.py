def generate_diagnostic(scores: dict, target_cutoffs: dict):
    """
    Compares student scores against target cutoffs and generates a diagnostic.
    
    :param scores: dict of {subject: student_score}
    :param target_cutoffs: dict of {subject: required_score}
    :return: dict containing diagnostic and recommendations
    """
    diagnostic = {}
    recommendations = []
    
    total_score = 0
    total_target = 0
    
    for subject, score in scores.items():
        cutoff = target_cutoffs.get(subject, 0)
        total_score += score
        total_target += cutoff
        
        status = "Above Target" if score >= cutoff else "Below Target"
        diagnostic[subject] = {"score": score, "target": cutoff, "status": status}
        
        if score < cutoff:
            deficit = cutoff - score
            recommendations.append(f"Focus on {subject} to improve your score by at least {deficit} points.")
            
    if not recommendations:
        overall_status = "Excellent"
        recommendations.append("Keep up the great work! You are meeting all target cutoffs.")
    elif total_score >= total_target:
        overall_status = "Good, but uneven"
    else:
        overall_status = "Needs Improvement"
        
    return {
        "overall_status": overall_status,
        "diagnostic": diagnostic,
        "recommendations": recommendations
    }
