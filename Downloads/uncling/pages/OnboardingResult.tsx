import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import LogoIcon from '../components/LogoIcon';
import { AttachmentStyle } from '../types';
import AttachmentGraph from '../components/AttachmentGraph';
import { Heart, Sparkles, Activity } from 'lucide-react';

// --- Archtype Content Data ---
// "World Class" specific copy for each attachment vibe
interface ArchetypeContent {
    name: string;
    impactBullets: string[]; // Step 4: How this shows up
    relationalBullets: string[]; // Step 7: Relational Impact
    strengthBullets: string[]; // Step 8: Strengths
    helpBullets: string[]; // Step 9: What helps
}

const ARCHETYPES: Record<AttachmentStyle, ArchetypeContent> = {
    [AttachmentStyle.Anxious]: {
        name: "A Connection-Oriented Pattern", // Soft, non-label label
        impactBullets: [
            "Thinking a lot about connection after uncertainty.",
            "Feeling unsettled when response times change.",
            "A strong drive to fix things immediately."
        ],
        relationalBullets: [
            "Deep care and reliable presence.",
            "Strong awareness of others’ moods.",
            "Difficulty resting when things feel unclear."
        ],
        strengthBullets: [
            "Emotional attunement and warmth.",
            "Loyalty and willingness to work through conflict.",
            "Capacity for deep closeness."
        ],
        helpBullets: [
            "Learning to regulate before seeking clarity.",
            "Noticing the urge to 'fix' without acting on it.",
            "Feeling safe enough to pause."
        ]
    },
    [AttachmentStyle.Avoidant]: {
        name: "A Space-Oriented Pattern",
        impactBullets: [
            "Feeling drained by too much interaction.",
            "Needing to pull away to regain balance.",
            "Comfort in self-reliance when things get emotional."
        ],
        relationalBullets: [
            "Steady presence in a crisis.",
            "Respect for boundaries and autonomy.",
            "Tendency to go quiet when overwhelmed."
        ],
        strengthBullets: [
            "Capability to stay calm under pressure.",
            "Independence and self-soothing skills.",
            "Respect for others' individuality."
        ],
        helpBullets: [
            "Small doses of connection.",
            "Realizing space is a need, not a weapon.",
            "Turning toward instead of turning away."
        ]
    },
    [AttachmentStyle.Fearful]: {
        name: "A Protective Pattern",
        impactBullets: [
            "Wanting closeness but fearing it at the same time.",
            "Feeling ‘on guard’ even in safe moments.",
            "Moving between needing people and needing to leave."
        ],
        relationalBullets: [
            "Deep desire to be seen and understood.",
            "High sensitivity to tone and shifts.",
            "Push-pull dynamics that feel confusing."
        ],
        strengthBullets: [
            "Incredible adaptability and intuition.",
            "Ability to read complex emotional layers.",
            "Deep empathy for suffering."
        ],
        helpBullets: [
            "Building trust in your own boundaries.",
            "Slowing down every interaction.",
            "Learning that 'consistent' is safer than 'intense'."
        ]
    },
    [AttachmentStyle.Secure]: {
        name: "A Balanced Pattern",
        impactBullets: [
            "Generally comfortable with intimacy.",
            "Able to ask for space without guilt.",
            "Trusting that conflict is solvable."
        ],
        relationalBullets: [
            "Serving as an anchor for others.",
            "Not taking moods personally.",
            "Consistency in showing up."
        ],
        strengthBullets: [
            "The ability to regulate and co-regulate.",
            "Resilience after rupture.",
            "Clarity in communication."
        ],
        helpBullets: [
            "Maintaining your own needs while supporting others.",
            "Being the 'secure base' without carrying everyone.",
            "Continuing to deepen emotional nuance."
        ]
    },
    [AttachmentStyle.Unknown]: {
        name: "An Emerging Pattern",
        impactBullets: [
            "You might be in a period of change.",
            "Reactions may depend heavily on who you are with.",
            "This map is still being drawn."
        ],
        relationalBullets: [
            "Adapting to the person you are with.",
            "Exploring what feels safe.",
            "Learning your own boundaries."
        ],
        strengthBullets: [
            "Flexibility.",
            "Openness to growth.",
            "Curiosity."
        ],
        helpBullets: [
            "Observation without judgment.",
            "Patience as patterns emerge.",
            "Simply noticing what feels good."
        ]
    }
};

type Step =
    | 15 // Entry
    | 16 // Reveal Name
    | 17 // Graph
    | 18 // How it shows up
    | 19 // Why
    | 20 // Biology
    | 21 // Relational
    | 22 // Strengths
    | 23 // What helps
    | 24; // Choice

const OnboardingResult: React.FC = () => {
    const location = ReactRouterDOM.useLocation();
    const navigate = ReactRouterDOM.useNavigate();
    const { updateOnboardingData } = useAuth();

    const result = location.state?.result;
    const [step, setStep] = useState<Step>(15);

    useEffect(() => {
        if (!result) return;
        const save = async () => {
            try { await updateOnboardingData(result); } catch (e) { console.error(e); }
        };
        save();
    }, [result]);

    if (!result) return <ReactRouterDOM.Navigate to="/onboarding" replace />;

    const { style } = result;
    const archetypes = ARCHETYPES[style as AttachmentStyle] || ARCHETYPES[AttachmentStyle.Unknown];
    const next = () => setStep(prev => (prev + 1) as Step);

    // Common container for specific visuals
    const Container = ({ children }: { children: React.ReactNode }) => (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in max-w-md mx-auto w-full">
            {children}
        </div>
    );

    const BulletList = ({ items }: { items: string[] }) => (
        <div className="text-left space-y-4 my-8 w-full bg-white/50 p-6 rounded-2xl border border-slate-100">
            {items.map((item, i) => (
                <div key={i} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-forest mt-2 shrink-0" />
                    <p className="text-slate-700 leading-relaxed">{item}</p>
                </div>
            ))}
        </div>
    );

    switch (step) {
        case 15: // Entry
            return (
                <Container>
                    <h1 className="text-2xl font-serif text-slate-800 mb-6">Here’s what your answers are pointing to.</h1>
                    <p className="text-lg text-slate-600 leading-relaxed mb-12">
                        This isn’t a verdict or a category.<br />
                        It’s a pattern — shaped by experience, protection, and learning.
                    </p>
                    <Button onClick={next} className="w-full sm:w-auto min-w-[200px]">Continue</Button>
                    <p className="text-xs text-slate-400 mt-6">You can stop at any point.</p>
                </Container>
            );

        case 16: // Reveal Name
            return (
                <Container>
                    <h1 className="text-2xl font-serif text-slate-800 mb-6 leading-snug">
                        You seem to lean toward<br />
                        <span className="text-forest">{style} patterns</span>.
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed mb-6">
                        This doesn’t define who you are.<br />
                        It describes how your system learned to relate under uncertainty.
                    </p>
                    <p className="text-sm text-slate-400 italic mb-12">Many people shift between styles depending on context.</p>
                    <Button onClick={next} className="w-full sm:w-auto min-w-[200px]">What does this mean?</Button>
                </Container>
            );

        case 17: // Graph
            return (
                <Container>
                    <h2 className="text-xl font-serif text-slate-800 mb-6">Emotional Tendencies</h2>
                    <div className="w-full mb-6">
                        <AttachmentGraph anxietyScore={result.anxietyScore || 18} avoidanceScore={result.avoidanceScore || 18} />
                    </div>
                    <p className="text-slate-600 mb-8 max-w-xs mx-auto">
                        These aren’t strengths or flaws.<br />
                        They’re signals your nervous system prioritizes.
                    </p>
                    <Button onClick={next} className="w-full sm:w-auto min-w-[200px]">How this shows up</Button>
                </Container>
            );

        case 18: // How it shows up
            return (
                <Container>
                    <h2 className="text-2xl font-serif text-slate-800 mb-2">This might feel familiar.</h2>
                    <BulletList items={archetypes.impactBullets} />
                    <Button onClick={next} className="w-full sm:w-auto min-w-[200px]">Why this makes sense</Button>
                </Container>
            );

        case 19: // Why
            return (
                <Container>
                    <h2 className="text-2xl font-serif text-slate-800 mb-6">Your system adapted intelligently.</h2>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                        <p className="text-lg text-slate-700 leading-relaxed mb-4">
                            These patterns usually form when connection feels important and unpredictable.
                        </p>
                        <p className="text-slate-600">
                            Your system learned ways to stay safe.
                        </p>
                    </div>
                    <p className="text-xs text-slate-400 mb-8">Nothing here is accidental.</p>
                    <Button onClick={next} className="w-full sm:w-auto min-w-[200px]">The biology behind this</Button>
                </Container>
            );

        case 20: // Biology
            return (
                <Container>
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                        <Activity size={24} />
                    </div>
                    <h2 className="text-2xl font-serif text-slate-800 mb-6">This isn’t just emotional — it’s biological.</h2>
                    <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-sm">
                        When connection feels uncertain, the nervous system can become more alert.<br /><br />
                        That alertness helped once — even if it’s tiring now.
                    </p>
                    <Button onClick={next} className="w-full sm:w-auto min-w-[200px]">How this affects relationships</Button>
                </Container>
            );

        case 21: // Relational Impact
            return (
                <Container>
                    <h2 className="text-2xl font-serif text-slate-800 mb-2">In relationships, this can look like…</h2>
                    <BulletList items={archetypes.relationalBullets} />
                    <p className="text-sm text-slate-400 mb-8">These patterns often coexist with empathy and depth.</p>
                    <Button onClick={next} className="w-full sm:w-auto min-w-[200px]">Strengths people often miss</Button>
                </Container>
            );

        case 22: // Strengths
            return (
                <Container>
                    <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
                        <Sparkles size={24} />
                    </div>
                    <h2 className="text-2xl font-serif text-slate-800 mb-2">There’s strength here too.</h2>
                    <p className="text-slate-600 mb-4">People with this pattern often bring:</p>
                    <BulletList items={archetypes.strengthBullets} />
                    <p className="text-sm text-slate-400 mb-8">Strength doesn’t mean ease.</p>
                    <Button onClick={next} className="w-full sm:w-auto min-w-[200px]">What usually helps</Button>
                </Container>
            );

        case 23: // What Helps
            return (
                <Container>
                    <h2 className="text-2xl font-serif text-slate-800 mb-2">What tends to help over time.</h2>
                    <BulletList items={archetypes.helpBullets} />
                    <p className="text-sm text-slate-400 mb-8">We’ll only explore these when you want to.</p>
                    <Button onClick={next} className="w-full sm:w-auto min-w-[200px]">How Unclinq supports this</Button>
                </Container>
            );

        case 24: // Choice (Exit)
            return (
                <Container>
                    <LogoIcon className="w-16 h-16 opacity-80 mb-6" />
                    <h2 className="text-2xl font-serif text-slate-800 mb-6">Here’s how Unclinq fits in.</h2>
                    <p className="text-lg text-slate-600 leading-relaxed mb-12 max-w-sm">
                        We help you slow things down, notice patterns gently, and build regulation before insight.
                    </p>
                    <div className="space-y-4 w-full max-w-xs">
                        <Button onClick={() => navigate('/dashboard')} className="w-full bg-slate-900 hover:bg-slate-800">
                            Start with a quiet check-in
                        </Button>
                        <button onClick={() => navigate('/dashboard')} className="w-full py-3 text-slate-500 hover:text-slate-700 transition-colors font-medium">
                            Explore this later
                        </button>
                    </div>
                    <p className="text-xs text-slate-300 mt-8">There’s no right pace.</p>
                </Container>
            );

        default:
            return null;
    }
};

export default OnboardingResult;
