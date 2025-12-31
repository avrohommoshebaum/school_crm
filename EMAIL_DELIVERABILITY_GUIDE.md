# Email Deliverability Guide

## Problem: Emails Going to Spam

If emails are going to spam for some recipients but not others, this is typically due to:
1. **Email provider differences** - Gmail, Outlook, Yahoo have different spam filters
2. **Missing domain authentication** - SPF, DKIM, DMARC records
3. **Unverified sender domain** - SendGrid needs your domain verified
4. **Sender reputation** - New/unverified domains have lower reputation

## Quick Fixes

### 1. Verify Your Domain in SendGrid (CRITICAL)

1. Go to SendGrid Dashboard → Settings → Sender Authentication
2. Click "Authenticate Your Domain"
3. Follow the wizard to add DNS records (SPF, DKIM, DMARC)
4. This is the **most important step** for deliverability

### 2. Check Your DNS Records

After verifying in SendGrid, make sure these records exist in your domain's DNS:

**SPF Record:**
```
Type: TXT
Name: @ (or your domain)
Value: v=spf1 include:sendgrid.net ~all
```

**DKIM Records:**
SendGrid will provide these - they look like:
```
Type: CNAME
Name: s1._domainkey.yourdomain.com
Value: s1.domainkey.sendgrid.net
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

### 3. Use a Verified Sender Domain

Make sure `SENDGRID_FROM` uses a domain you own and have verified in SendGrid:
- ✅ Good: `notifications@nachlasby.org`
- ❌ Bad: `noreply@gmail.com` or unverified domains

### 4. Check SendGrid Account Status

- **Trial accounts** have lower deliverability
- **Paid accounts** have better reputation
- Check your SendGrid dashboard for any warnings or limits

### 5. Email Content Best Practices

Avoid spam trigger words:
- ❌ "Free", "Click here", "Act now", "Limited time"
- ✅ Use clear, professional language

Good email structure:
- Clear subject line
- Professional HTML formatting
- Plain text alternative (already included)
- Unsubscribe option (now included in headers)

### 6. Warm Up Your Domain (For New Domains)

If you just set up a new domain:
1. Start with small volumes (10-20 emails/day)
2. Gradually increase over 2-4 weeks
3. Monitor bounce rates and spam complaints

### 7. Monitor SendGrid Activity

Check SendGrid Dashboard → Activity:
- Look for bounces, spam reports, blocks
- High bounce rate (>5%) hurts reputation
- Spam complaints hurt reputation

## Testing Deliverability

### Test Your Email Setup

1. **Send test emails** to different providers:
   - Gmail
   - Outlook/Hotmail
   - Yahoo
   - Your organization's email

2. **Check email headers** (in Gmail: Show original):
   - Look for `SPF: PASS`
   - Look for `DKIM: PASS`
   - Look for `DMARC: PASS`

3. **Use email testing tools**:
   - [Mail-Tester.com](https://www.mail-tester.com) - Send to their address and get a score
   - [MXToolbox](https://mxtoolbox.com/spf.aspx) - Check SPF records

## Current Configuration

Your emails are being sent with:
- ✅ Plain text alternative
- ✅ List-Unsubscribe headers (only when using display names - helps with Gmail/Outlook)
- ✅ Proper reply-to handling
- ✅ No tracking (better for privacy/deliverability)
- ✅ SendGrid's from object format (better deliverability than string format)
- ✅ Removed "Precedence: bulk" header (was causing spam issues with display names)

## Display Name Best Practices

When using a "From Name" (display name):
- ✅ Keep it short and simple: "Nachlas BY" or "Nachlas Portal"
- ✅ Avoid special characters or emojis
- ✅ Use your organization's actual name
- ❌ Don't use all caps
- ❌ Don't use sales-y language like "Special Offer" or "Act Now"
- ❌ Don't use multiple punctuation marks

**Note:** If emails go to spam when using a display name, consider:
1. Using a simpler, shorter name
2. Not using a display name at all (just the email address)
3. Ensuring your domain is fully verified in SendGrid

## Next Steps

1. **Verify your domain in SendGrid** (most important)
2. **Add DNS records** (SPF, DKIM, DMARC)
3. **Test with Mail-Tester.com** to get a deliverability score
4. **Monitor SendGrid activity** for issues

## If Still Going to Spam

1. Check recipient's spam folder settings
2. Ask recipient to mark as "Not Spam" and add to contacts
3. Check SendGrid reputation score
4. Consider using a dedicated IP (SendGrid paid feature)
5. Review email content for spam triggers

## Support

- SendGrid Support: https://support.sendgrid.com
- SendGrid Deliverability Guide: https://sendgrid.com/resource/email-deliverability-guide/

