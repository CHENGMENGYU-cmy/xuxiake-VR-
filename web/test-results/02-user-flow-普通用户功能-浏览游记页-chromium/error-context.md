# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-user-flow.spec.ts >> 普通用户功能 >> 浏览游记页
- Location: e2e\02-user-flow.spec.ts:82:7

# Error details

```
Error: page.evaluate: TypeError: Failed to fetch
    at eval (eval at evaluate (:311:30), <anonymous>:2:23)
    at UtilityScript.evaluate (<anonymous>:313:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - generic [ref=f1e4]:
    - generic [ref=f1e5]:
      - link "徐 徐霞客" [ref=f1e6] [cursor=pointer]:
        - /url: /
        - generic [ref=f1e7]: 徐
        - generic [ref=f1e9]: 徐霞客
      - paragraph [ref=f1e10]: 戴智能眼镜，连接志同道合的探索者
    - generic [ref=f1e11]:
      - generic [ref=f1e12]: 登录徐霞客系统
      - generic [ref=f1e14]:
        - generic [ref=f1e15]:
          - button "邮箱/用户名" [ref=f1e16]
          - button "手机号登录" [ref=f1e17]
        - generic [ref=f1e18]:
          - generic [ref=f1e19]:
            - text: 邮箱或用户名
            - textbox "输入邮箱或用户名" [ref=f1e24]
          - generic [ref=f1e25]:
            - text: 密码
            - generic [ref=f1e26]:
              - textbox "输入密码" [ref=f1e30]
              - button [ref=f1e31]
          - generic [ref=f1e35]:
            - text: 验证码
            - generic [ref=f1e36]:
              - textbox "请输入4位验证码" [ref=f1e40]
              - button "看不清？点击刷新" [ref=f1e41]
          - button "登录" [ref=f1e48]
          - generic [ref=f1e49]: 其他登录方式
          - generic [ref=f1e54]:
            - button "微信登录" [ref=f1e55]
            - button "支付宝登录" [ref=f1e58]
      - paragraph [ref=f1e62]:
        - text: 还没有账号？
        - link "立即注册" [ref=f1e63] [cursor=pointer]:
          - /url: /register
  - region "Notifications alt+T"
  - alert [ref=f1e64]
```