# Agents Directory

Direktori ini berisi file-file markdown yang berfungsi sebagai "agents" - dokumentasi terstruktur yang berisi informasi spesifik tentang berbagai aspek proyek TIC.

## Purpose
Setiap agent file berisi informasi yang dapat digunakan untuk:
- Memahami konteks proyek dengan cepat
- Menjadi referensi saat development
- Onboarding developer baru
- Dokumentasi arsitektur dan keputusan teknis

## Agent Files Structure

### Naming Convention
- Format: `{topic}-agent.md`
- Contoh: `project-info-agent.md`, `database-agent.md`, `api-agent.md`

### Template Structure
```markdown
# {Topic} Agent

## {Topic} Overview
Brief description

## Key Information
- Important points
- Technical details
- Configurations

## Usage Notes
When to use this information

Last updated: {date}
```

## Current Agents
- **project-info-agent.md** - Informasi umum proyek, tech stack, dan struktur

## Planned Agents
- `database-agent.md` - Schema database dan migration strategies
- `api-agent.md` - tRPC procedures dan endpoint documentation
- `auth-agent.md` - Authentication flow dan security practices  
- `deployment-agent.md` - Deployment procedures dan environment setup
- `integration-agent.md` - External system integrations (Odoo, etc.)

## Usage Guidelines
1. Update agents ketika ada perubahan signifikan
2. Gunakan format markdown yang konsisten
3. Include tanggal last updated
4. Focus pada informasi yang actionable dan relevant
5. Link ke file terkait jika diperlukan

## Maintenance
- Review agents setiap milestone
- Update ketika ada perubahan arsitektur
- Archive agents yang sudah tidak relevan