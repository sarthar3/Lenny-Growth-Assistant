from app.utils.security import sanitize_html, get_security_policy

def test_sanitize_html_script_stripping():
    unsafe_html = "<div><h1>Title</h1><script>alert('xss');</script><p onclick='bad()'>Hello</p></div>"
    clean = sanitize_html(unsafe_html)
    assert "<script>" not in clean
    assert "alert('xss')" not in clean
    assert "onclick=" not in clean
    assert "<h1>Title</h1>" in clean

def test_security_policy_meta():
    policy = get_security_policy()
    assert "isolation_strategy" in policy
    assert "iframe_sandbox" in policy
    assert "<script>" in policy["blocked_elements"]
