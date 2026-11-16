import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db import run_query

BASELINE_KRS = [
    # 1. PS.HOV (Atharav)
    {
        'venture_name': 'PS.HOV',
        'sl_no': 1,
        'lead_slug': 'atharav',
        'krs': [
            ('1.1', 'Portal core layout & admin panel live updates operational', '100% verified', 'completed'),
            ('1.2', 'Complete cross-browser responsiveness & dark theme validation', 'Pass all viewport tests', 'pending'),
        ],
        'actions': [
            ('Configure Supabase authentication and session persistence', 'completed'),
            ('Validate mobile drawer and action item status dropdowns', 'in_progress'),
        ]
    },
    # 2. HBM (Rufus)
    {
        'venture_name': 'PS.HOV - House_of_Business_Markering (HBM)',
        'sl_no': 1,
        'lead_slug': 'rufus',
        'krs': [
            ('1.1', 'Finalize HBM B2B marketing service deck & pricing tiers', 'Sign-off from founder', 'completed'),
            ('1.2', 'Launch inbound lead inquiry funnel and connect webhook', '0 dropped leads', 'pending'),
        ],
        'actions': [
            ('Review client proposal templates with Mary Kennedy legal lead', 'completed'),
        ]
    },
    # 3. HAIS (Sharuk)
    {
        'venture_name': 'PS.HOV - House_of_AI_Solutions (HAIS)',
        'sl_no': 1,
        'lead_slug': 'sharuk',
        'krs': [
            ('1.1', 'Complete UX wireframes & promotional copy for HAIS platform', '100% approved by Founder', 'completed'),
            ('1.2', 'Deploy high-performance responsive site with SSL on Vercel', '99.9% uptime & 0 console errors', 'pending'),
        ],
        'actions': [
            ('Finalize high-fidelity hero section and feature cards in Figma', 'completed'),
            ('Implement Next.js 15 Tailwind UI and test mobile navigation', 'in_progress'),
        ]
    },
    # 4. XARM MARSERV (Atharav)
    {
        'venture_name': 'XARM MARSERV',
        'sl_no': 1,
        'lead_slug': 'atharav',
        'krs': [
            ('1.1', 'Deploy unified deliverable tracker matrix for marketing clients', '100% operational', 'completed'),
            ('1.2', 'Automate monthly client SLA performance reports', 'Zero delay SLA', 'pending'),
        ],
        'actions': [
            ('Create central Google Sheet and link to Next.js API endpoint', 'completed'),
        ]
    },
    # 5. Impactshaala (Atharav)
    {
        'venture_name': 'Impactshaala',
        'sl_no': 1,
        'lead_slug': 'atharav',
        'krs': [
            ('1.1', 'Audit version 1 feature completion across all 5 user modules', 'Pass QA criteria', 'completed'),
            ('1.2', 'Lock v1 beta launch milestone date with engineering team', 'Sign-off from founder', 'pending'),
        ],
        'actions': [
            ('Document beta testing punch list and submit for review', 'completed'),
        ]
    },
    # 6. GUIDESHAALA (Sharuk)
    {
        'venture_name': 'GUIDESHAALA',
        'sl_no': 1,
        'lead_slug': 'sharuk',
        'krs': [
            ('1.1', 'Finalize career assessment psychometric test flow & scoring logic', '100% test accuracy', 'completed'),
            ('1.2', 'Launch student dashboard pilot for grade 10-12 cohorts', '50 student pilot', 'pending'),
        ],
        'actions': [
            ('Prototype scoring matrix for career counselling engine', 'completed'),
        ]
    },
    # 7. PulseEvents (Sharuk)
    {
        'venture_name': 'PulseEvents',
        'sl_no': 1,
        'lead_slug': 'sharuk',
        'krs': [
            ('1.1', 'Complete PulseEvents brand guidelines, logo assets, and ticketing UI', 'Brand sign-off', 'completed'),
            ('1.2', 'Connect event RSVP and ticketing webhook to database', '0 dropped registrations', 'pending'),
        ],
        'actions': [
            ('Design event ticketing page with QR code verification', 'completed'),
        ]
    },
    # 8. NxtGen Impact (Atharav)
    {
        'venture_name': 'NxtGen Impact',
        'sl_no': 1,
        'lead_slug': 'atharav',
        'krs': [
            ('1.1', 'Draft comprehensive impact mission website copy and NGO pitch', 'Approved by founder', 'completed'),
            ('1.2', 'Publish impact reports showcase and donor engagement landing page', '100% live on Vercel', 'pending'),
        ],
        'actions': [
            ('Write first draft of website copy and stakeholder testimonials', 'completed'),
        ]
    },
    # 9. CreativeTech (Sharuk)
    {
        'venture_name': 'CreativeTech',
        'sl_no': 1,
        'lead_slug': 'sharuk',
        'krs': [
            ('1.1', 'Benchmark top 25 generative AI design and image synthesis tools', 'Complete feature matrix', 'completed'),
            ('1.2', 'Build integrated AI prompt-to-asset workflow template', 'Production ready', 'pending'),
        ],
        'actions': [
            ('Test Midjourney, Fal.ai, and Flux APIs for studio asset generation', 'completed'),
        ]
    },
    # 10. LeadTech (Atharav)
    {
        'venture_name': 'LeadTech',
        'sl_no': 1,
        'lead_slug': 'atharav',
        'krs': [
            ('1.1', 'Curate and evaluate open-source web scraping repositories', 'Evaluate top 10 repos', 'completed'),
            ('1.2', 'Deploy automated lead enrichment and email verification pipeline', '95%+ email deliverability', 'pending'),
        ],
        'actions': [
            ('Set up Puppeteer / Playwright headless scraper for business directories', 'completed'),
        ]
    },
    # 11. Law Offices of Mary Kennedy (Rufus)
    {
        'venture_name': 'Law Offices of Mary Kennedy',
        'sl_no': 1,
        'lead_slug': 'rufus',
        'krs': [
            ('1.1', 'Map business immigration client journey & legal compliance gates', '100% legal sign-off', 'completed'),
            ('1.2', 'Publish secure client intake questionnaire and case filing portal', 'Zero data leak', 'pending'),
        ],
        'actions': [
            ('Review EB-1 / O-1 visa checklist and digital documentation workflow', 'completed'),
        ]
    },
    # 12. Point Square Realty (Sharuk)
    {
        'venture_name': 'Point Square Realty',
        'sl_no': 1,
        'lead_slug': 'sharuk',
        'krs': [
            ('1.1', 'Establish weekly social media posting cadence and content pillars', '100% schedule adherence', 'completed'),
            ('1.2', 'Deploy luxury property listing catalog and lead capture landing page', '100% live with analytics', 'pending'),
        ],
        'actions': [
            ('Create monthly social media calendar with Canva asset templates', 'completed'),
        ]
    },
    # 13. PS.HOV Investments & Funding (Rufus)
    {
        'venture_name': 'PS.HOV Investments & Funding',
        'sl_no': 1,
        'lead_slug': 'rufus',
        'krs': [
            ('1.1', 'Build verified angel investor and syndicate venture database', '500+ verified entries', 'completed'),
            ('1.2', 'Launch founder ecosystem pitch deck distribution pipeline', 'Zero bounce rate', 'pending'),
        ],
        'actions': [
            ('Clean and enrich investor database with contact details and focus sectors', 'completed'),
        ]
    },
]

def main():
    print("Seeding baseline Key Results across all 13 ventures...")
    seeded_krs_count = 0
    seeded_actions_count = 0

    for item in BASELINE_KRS:
        v_name = item['venture_name']
        sl_no = item['sl_no']
        lead_slug = item['lead_slug']

        # Find objective and venture
        q = f"""
        SELECT o.id as obj_id, o.venture_id, p.id as lead_id
        FROM public.objectives o
        JOIN public.ventures v ON o.venture_id = v.id
        LEFT JOIN public.profiles p ON p.slug = '{lead_slug}'
        WHERE v.name = '{v_name}' AND o.sl_no = {sl_no};
        """
        res = run_query(q)
        if not res:
            continue

        obj_id = res[0]['obj_id']
        v_id = res[0]['venture_id']
        lead_id = res[0]['lead_id']

        # Check existing KRs for this objective
        existing = run_query(f"SELECT count(*) FROM public.key_results WHERE objective_id = '{obj_id}';")
        if existing and existing[0]['count'] == 0:
            kr_ids = []
            for kr_code, title, target, status in item['krs']:
                kr_id = run_query(f"""
                INSERT INTO public.key_results (objective_id, venture_id, kr_code, title, target_measure, status, owner_id)
                VALUES ('{obj_id}', '{v_id}', '{kr_code}', '{title}', '{target}', '{status}', '{lead_id}')
                RETURNING id;
                """)[0]['id']
                kr_ids.append(kr_id)
                seeded_krs_count += 1

            # Update objective status from no_krs to pending
            run_query(f"UPDATE public.objectives SET status = 'pending' WHERE id = '{obj_id}' AND status = 'no_krs';")

            # Seed sample actions if provided
            if kr_ids and item.get('actions'):
                for i, (action_title, action_status) in enumerate(item['actions']):
                    linked_kr = kr_ids[min(i, len(kr_ids) - 1)]
                    run_query(f"""
                    INSERT INTO public.action_items (venture_id, objective_id, key_result_id, title, assigned_to, date, status, is_planned)
                    VALUES ('{v_id}', '{obj_id}', '{linked_kr}', '{action_title}', '{lead_id}', '2026-11-16', '{action_status}', false);
                    """)
                    seeded_actions_count += 1

            print(f"  -> Seeded {len(kr_ids)} KRs for [{v_name}] Obj #{sl_no}")

    print(f"Completed! Seeded {seeded_krs_count} new KRs and {seeded_actions_count} new action items.")

if __name__ == '__main__':
    main()
