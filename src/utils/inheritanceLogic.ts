export type Gender = 'male' | 'female';

export interface Relative {
    id: string;
    name: string; // key for translation
    type: RelativeType; // e.g., 'husband', 'wife', 'son', 'daughter', etc.
    count: number; // For multiple daughters, sisters, etc.
}

export type RelativeType =
    | 'husband'
    | 'wife'
    | 'father'
    | 'mother'
    | 'son'
    | 'daughter'
    | 'grandson' // Son's son
    | 'granddaughter' // Son's daughter
    | 'full_brother'
    | 'full_sister'
    | 'paternal_brother'
    | 'paternal_sister'
    | 'maternal_brother'
    | 'maternal_sister'
    | 'grandfather'
    | 'grandmother'
    | 'full_nephew' // Full brother's son
    | 'paternal_nephew' // Paternal brother's son
    | 'full_uncle' // Father's full brother
    | 'paternal_uncle' // Father's paternal brother
    | 'full_cousin' // Full uncle's son
    | 'paternal_cousin'; // Paternal uncle's son

export interface ShareResult {
    relativeType: RelativeType;
    shareFraction: string; // Aproximate display string
    shareValue: number;    // Calculated monetary amount
    percentage: number;    // Percentage of total (0-1)
    count: number;         // Count of this relative type
    notes?: string;
    noteKey?: string;
    hasRadd?: boolean;
}

export interface CalculationInput {
    deceasedGender: Gender;
    relatives: Relative[];
    totalWealth: number;
}

export const calculateInheritance = (input: CalculationInput): ShareResult[] => {
    let { deceasedGender, relatives, totalWealth } = input;

    const counts: Record<RelativeType, number> = {
        husband: 0, wife: 0, father: 0, mother: 0, son: 0, daughter: 0,
        grandson: 0, granddaughter: 0, full_brother: 0, full_sister: 0,
        paternal_brother: 0, paternal_sister: 0, maternal_brother: 0, maternal_sister: 0,
        grandfather: 0, grandmother: 0, full_nephew: 0, paternal_nephew: 0,
        full_uncle: 0, paternal_uncle: 0, full_cousin: 0, paternal_cousin: 0
    };

    relatives.forEach(r => {
        counts[r.type] = (counts[r.type] || 0) + r.count;
    });

    // --- 1. EXCLUSION (HAJB) ---
    const hasSon = counts.son > 0;
    const hasDaughter = counts.daughter > 0;
    const hasMultipleDaughters = counts.daughter >= 2;
    const hasGrandson = counts.grandson > 0;
    const hasGranddaughter = counts.granddaughter > 0;
    const hasMaleDescendant = hasSon || hasGrandson;
    const hasDescendant = hasSon || hasDaughter || hasGrandson || hasGranddaughter;
    const hasFather = counts.father > 0;
    const hasMother = counts.mother > 0;
    const hasGrandfather = counts.grandfather > 0;
    const hasGrandmother = counts.grandmother > 0;

    const siblingCount = counts.full_brother + counts.full_sister +
        counts.paternal_brother + counts.paternal_sister +
        counts.maternal_brother + counts.maternal_sister;

    // Relative levels for Asaba hierarchy
    const hasSonOrGrandson = hasSon || hasGrandson;
    const hasMaleAscendant = hasFather || hasGrandfather;

    // Filter out excluded relatives
    if (hasSon) {
        counts.grandson = 0;
        counts.granddaughter = 0;
        // Son excludes all grandsons/granddaughters
    }
    if (hasFather) {
        counts.grandfather = 0;
    }
    if (hasMother) {
        counts.grandmother = 0; // Mother blocks all grandmothers
    }

    // Siblings blocks
    if (hasMaleDescendant || hasFather) {
        counts.full_brother = 0; counts.full_sister = 0;
        counts.paternal_brother = 0; counts.paternal_sister = 0;
        counts.maternal_brother = 0; counts.maternal_sister = 0;
    }
    if (hasGrandfather) {
        counts.maternal_brother = 0; counts.maternal_sister = 0;
        counts.full_brother = 0; counts.full_sister = 0;
        counts.paternal_brother = 0; counts.paternal_sister = 0;
    }

    // Distant male relatives exclusion
    const blockDistant = hasMaleDescendant || hasFather || hasGrandfather || counts.full_brother > 0 || counts.paternal_brother > 0;

    if (blockDistant) {
        counts.full_nephew = 0; counts.paternal_nephew = 0;
        counts.full_uncle = 0; counts.paternal_uncle = 0;
        counts.full_cousin = 0; counts.paternal_cousin = 0;
    }
    // Specific hierarchy among them
    if (counts.full_nephew > 0) { counts.paternal_nephew = 0; counts.full_uncle = 0; counts.paternal_uncle = 0; counts.full_cousin = 0; counts.paternal_cousin = 0; }
    if (counts.paternal_nephew > 0) { counts.full_uncle = 0; counts.paternal_uncle = 0; counts.full_cousin = 0; counts.paternal_cousin = 0; }
    if (counts.full_uncle > 0) { counts.paternal_uncle = 0; counts.full_cousin = 0; counts.paternal_cousin = 0; }
    if (counts.paternal_uncle > 0) { counts.full_cousin = 0; counts.paternal_cousin = 0; }
    if (counts.full_cousin > 0) { counts.paternal_cousin = 0; }

    // --- 2. FARD (PRESCRIBED SHARES) ---
    let shares: { type: RelativeType; share: number; isFard: boolean; note: string; noteKey?: string }[] = [];

    // Husband
    if (counts.husband > 0) {
        const share = hasDescendant ? 0.25 : 0.5;
        shares.push({
            type: 'husband',
            share,
            isFard: true,
            note: hasDescendant ? '1/4 (Existence of descendants)' : '1/2 (Absence of descendants)',
            noteKey: hasDescendant ? 'mirath_results.rules.husband_1_4' : 'mirath_results.rules.husband_1_2'
        });
    }

    // Wife
    if (counts.wife > 0) {
        const share = hasDescendant ? 0.125 : 0.25;
        shares.push({
            type: 'wife',
            share,
            isFard: true,
            note: hasDescendant ? '1/8 (Existence of descendants)' : '1/4 (Absence of descendants)',
            noteKey: hasDescendant ? 'mirath_results.rules.wife_1_8' : 'mirath_results.rules.wife_1_4'
        });
    }

    // Father / Grandfather
    if (counts.father > 0) {
        if (hasMaleDescendant) {
            shares.push({ type: 'father', share: 1 / 6, isFard: true, note: '1/6 (Existence of male descendant)', noteKey: 'mirath_results.rules.father_1_6' });
        } else if (hasDescendant) {
            shares.push({ type: 'father', share: 1 / 6, isFard: true, note: '1/6 + Residue (Existence of female descendant)', noteKey: 'mirath_results.rules.father_1_6_residue' });
        } else {
            shares.push({ type: 'father', share: 0, isFard: false, note: 'Residuary (No descendants)', noteKey: 'mirath_results.rules.father_residue' });
        }
    } else if (counts.grandfather > 0) {
        if (hasMaleDescendant) {
            shares.push({ type: 'grandfather', share: 1 / 6, isFard: true, note: '1/6 (Existence of male descendant)', noteKey: 'mirath_results.rules.father_1_6' });
        } else if (hasDescendant) {
            shares.push({ type: 'grandfather', share: 1 / 6, isFard: true, note: '1/6 + Residue (Existence of female descendant)', noteKey: 'mirath_results.rules.father_1_6_residue' });
        } else {
            shares.push({ type: 'grandfather', share: 0, isFard: false, note: 'Residuary (No descendants)', noteKey: 'mirath_results.rules.father_residue' });
        }
    }

    // Mother / Grandmother
    if (counts.mother > 0) {
        const isUmariyyatayn = !hasDescendant && siblingCount === 0 && counts.father > 0;

        if (isUmariyyatayn && (counts.husband > 0 || counts.wife > 0)) {
            const spouseShare = counts.husband > 0 ? 0.5 : 0.25;
            const motherShare = (1 - spouseShare) / 3;
            shares.push({
                type: 'mother',
                share: motherShare,
                isFard: true,
                note: '1/3 of Remainder (Umariyyatayn)',
                noteKey: 'mirath_results.umariyyatayn_note'
            });
        } else if (hasDescendant || siblingCount >= 2) {
            shares.push({ type: 'mother', share: 1 / 6, isFard: true, note: '1/6 (Existence of descendants or 2+ siblings)', noteKey: 'mirath_results.rules.mother_1_6' });
        } else {
            shares.push({ type: 'mother', share: 1 / 3, isFard: true, note: '1/3 (No blocking heirs)', noteKey: 'mirath_results.rules.mother_1_3' });
        }
    } else if (counts.grandmother > 0) {
        shares.push({ type: 'grandmother', share: 1 / 6, isFard: true, note: '1/6 (Mother is absent)', noteKey: 'mirath_results.rules.grandmother_1_6' });
    }

    // --- Daughters & Granddaughters
    if (!hasSon) {
        if (counts.daughter > 0) {
            const share = counts.daughter === 1 ? 0.5 : (2 / 3);
            shares.push({
                type: 'daughter',
                share,
                isFard: true,
                note: counts.daughter === 1 ? '1/2' : '2/3',
                noteKey: counts.daughter === 1 ? 'mirath_results.rules.daughter_1_2' : 'mirath_results.rules.daughter_2_3'
            });

            if (counts.daughter === 1 && counts.granddaughter > 0 && !hasGrandson) {
                shares.push({ type: 'granddaughter', share: 1 / 6, isFard: true, note: '1/6 (With one daughter)', noteKey: 'mirath_results.rules.granddaughter_1_6' });
            }
        } else if (counts.granddaughter > 0 && !hasGrandson) {
            const share = counts.granddaughter === 1 ? 0.5 : (2 / 3);
            shares.push({
                type: 'granddaughter',
                share,
                isFard: true,
                note: counts.granddaughter === 1 ? '1/2' : '2/3',
                noteKey: counts.granddaughter === 1 ? 'mirath_results.rules.daughter_1_2' : 'mirath_results.rules.daughter_2_3'
            });
        }
    }

    // --- Sisters
    if (counts.maternal_brother + counts.maternal_sister > 0) {
        const totalMaternal = counts.maternal_brother + counts.maternal_sister;
        const share = totalMaternal === 1 ? 1 / 6 : 1 / 3;
        const note = totalMaternal === 1 ? '1/6 (Single maternal sibling)' : '1/3 (Multiple maternal siblings)';
        const noteKey = totalMaternal === 1 ? 'mirath_results.rules.maternal_1_6' : 'mirath_results.rules.maternal_1_3';

        if (counts.maternal_brother > 0) shares.push({ type: 'maternal_brother', share: share * (counts.maternal_brother / totalMaternal), isFard: true, note, noteKey });
        if (counts.maternal_sister > 0) shares.push({ type: 'maternal_sister', share: share * (counts.maternal_sister / totalMaternal), isFard: true, note, noteKey });
    }

    if (!hasMaleDescendant && !hasFather && !hasGrandfather && counts.full_brother === 0) {
        if (counts.full_sister > 0) {
            if (!(hasDaughter || hasGranddaughter)) {
                const share = counts.full_sister === 1 ? 0.5 : 2 / 3;
                shares.push({
                    type: 'full_sister',
                    share,
                    isFard: true,
                    note: counts.full_sister === 1 ? '1/2' : '2/3',
                    noteKey: counts.full_sister === 1 ? 'mirath_results.rules.daughter_1_2' : 'mirath_results.rules.daughter_2_3'
                });
            }
        }
    }
    if (!hasMaleDescendant && !hasFather && !hasGrandfather && counts.full_brother === 0 && counts.paternal_brother === 0) {
        if (counts.paternal_sister > 0) {
            if (!(hasDaughter || hasGranddaughter)) {
                if (counts.full_sister === 1) {
                    shares.push({ type: 'paternal_sister', share: 1 / 6, isFard: true, note: '1/6 (With one full sister)', noteKey: 'mirath_results.rules.paternal_sister_1_6' });
                } else if (counts.full_sister === 0) {
                    const share = counts.paternal_sister === 1 ? 0.5 : 2 / 3;
                    shares.push({
                        type: 'paternal_sister',
                        share,
                        isFard: true,
                        note: counts.paternal_sister === 1 ? '1/2' : '2/3',
                        noteKey: counts.paternal_sister === 1 ? 'mirath_results.rules.daughter_1_2' : 'mirath_results.rules.daughter_2_3'
                    });
                }
            }
        }
    }

    let totalFardShare = shares.reduce((sum, s) => sum + s.share, 0);

    if (totalFardShare > 1) {
        shares = shares.map(s => ({ ...s, share: s.share / totalFardShare }));
        totalFardShare = 1;
    }

    let residue = 1 - totalFardShare;

    if (residue > 0.000001) {
        if (counts.son > 0) {
            const numSons = counts.son;
            const numDaughters = counts.daughter;
            const totalParts = (numSons * 2) + numDaughters;
            const unitShare = residue / totalParts;
            shares.push({ type: 'son', share: (unitShare * 2 * numSons), isFard: false, note: 'Asabah (2:1 ratio with daughters)', noteKey: 'mirath_results.rules.asabah_2_1_descendants' });
            if (numDaughters > 0) shares.push({ type: 'daughter', share: (unitShare * numDaughters), isFard: false, note: 'Asabah (1:2 ratio with sons)', noteKey: 'mirath_results.rules.asabah_1_2_descendants' });
            residue = 0;
        }
        else if (counts.grandson > 0) {
            const numGrandsons = counts.grandson;
            const numGranddaughters = counts.granddaughter;
            const totalParts = (numGrandsons * 2) + numGranddaughters;
            const unitShare = residue / totalParts;
            shares.push({ type: 'grandson', share: (unitShare * 2 * numGrandsons), isFard: false, note: 'Asabah (2:1 ratio with granddaughters)', noteKey: 'mirath_results.rules.asabah_2_1_grandchildren' });
            if (numGranddaughters > 0) shares.push({ type: 'granddaughter', share: (unitShare * numGranddaughters), isFard: false, note: 'Asabah (1:2 ratio with grandsons)', noteKey: 'mirath_results.rules.asabah_1_2_grandchildren' });
            residue = 0;
        }
        else if (counts.father > 0) {
            const fatherShare = shares.find(s => s.type === 'father');
            if (fatherShare) { fatherShare.share += residue; fatherShare.note += ' + Residue'; }
            else shares.push({ type: 'father', share: residue, isFard: false, note: 'Asabah', noteKey: 'mirath_results.rules.asabah' });
            residue = 0;
        }
        else if (counts.grandfather > 0) {
            const grandfatherShare = shares.find(s => s.type === 'grandfather');
            if (grandfatherShare) { grandfatherShare.share += residue; grandfatherShare.note += ' + Residue'; }
            else shares.push({ type: 'grandfather', share: residue, isFard: false, note: 'Asabah', noteKey: 'mirath_results.rules.asabah' });
            residue = 0;
        }
        else if (counts.full_brother > 0 || (counts.full_sister > 0 && (hasDaughter || hasGranddaughter))) {
            const numBrothers = counts.full_brother;
            const numSisters = counts.full_sister;
            if (numBrothers > 0) {
                const totalParts = (numBrothers * 2) + numSisters;
                const unitShare = residue / totalParts;
                shares.push({ type: 'full_brother', share: (unitShare * 2 * numBrothers), isFard: false, note: 'Asabah (2:1 ratio with sisters)', noteKey: 'mirath_results.rules.asabah_2_1_siblings' });
                if (numSisters > 0) shares.push({ type: 'full_sister', share: (unitShare * numSisters), isFard: false, note: 'Asabah (1:2 ratio with brothers)', noteKey: 'mirath_results.rules.asabah_1_2_siblings' });
            } else {
                shares.push({ type: 'full_sister', share: residue, isFard: false, note: 'Asabah (with daughters)', noteKey: 'mirath_results.rules.asabah_with_daughters' });
            }
            residue = 0;
        }
        else if (counts.paternal_brother > 0 || (counts.paternal_sister > 0 && (hasDaughter || hasGranddaughter))) {
            const numBrothers = counts.paternal_brother;
            const numSisters = counts.paternal_sister;
            if (numBrothers > 0) {
                const totalParts = (numBrothers * 2) + numSisters;
                const unitShare = residue / totalParts;
                shares.push({ type: 'paternal_brother', share: (unitShare * 2 * numBrothers), isFard: false, note: 'Asabah (2:1 ratio with sisters)', noteKey: 'mirath_results.rules.asabah_2_1_siblings' });
                if (numSisters > 0) shares.push({ type: 'paternal_sister', share: (unitShare * numSisters), isFard: false, note: 'Asabah (1:2 ratio with brothers)', noteKey: 'mirath_results.rules.asabah_1_2_siblings' });
            } else {
                shares.push({ type: 'paternal_sister', share: residue, isFard: false, note: 'Asabah (with daughters)', noteKey: 'mirath_results.rules.asabah_with_daughters' });
            }
            residue = 0;
        }
        else if (counts.full_nephew > 0) { shares.push({ type: 'full_nephew', share: residue, isFard: false, note: 'Asabah', noteKey: 'mirath_results.rules.asabah' }); residue = 0; }
        else if (counts.paternal_nephew > 0) { shares.push({ type: 'paternal_nephew', share: residue, isFard: false, note: 'Asabah', noteKey: 'mirath_results.rules.asabah' }); residue = 0; }
        else if (counts.full_uncle > 0) { shares.push({ type: 'full_uncle', share: residue, isFard: false, note: 'Asabah', noteKey: 'mirath_results.rules.asabah' }); residue = 0; }
        else if (counts.paternal_uncle > 0) { shares.push({ type: 'paternal_uncle', share: residue, isFard: false, note: 'Asabah', noteKey: 'mirath_results.rules.asabah' }); residue = 0; }
        else if (counts.full_cousin > 0) { shares.push({ type: 'full_cousin', share: residue, isFard: false, note: 'Asabah', noteKey: 'mirath_results.rules.asabah' }); residue = 0; }
        else if (counts.paternal_cousin > 0) { shares.push({ type: 'paternal_cousin', share: residue, isFard: false, note: 'Asabah', noteKey: 'mirath_results.rules.asabah' }); residue = 0; }
    }

    if (residue > 0.000001) {
        const fardHeirsNoSpouse = shares.filter(s => s.type !== 'husband' && s.type !== 'wife');
        if (fardHeirsNoSpouse.length > 0) {
            const spouseShareSum = shares.filter(s => s.type === 'husband' || s.type === 'wife').reduce((sum, s) => sum + s.share, 0);
            const remainderForRadd = 1 - spouseShareSum;
            const currentRaddSum = fardHeirsNoSpouse.reduce((sum, s) => sum + s.share, 0);

            fardHeirsNoSpouse.forEach(s => {
                s.share = (s.share / currentRaddSum) * remainderForRadd;
                s.note += ' (Increased by Radd)';
                (s as any).hasRadd = true;
            });
            residue = 0;
        }
    }

    return shares.map(s => ({
        relativeType: s.type,
        shareFraction: s.share.toFixed(4),
        percentage: s.share,
        shareValue: s.share * totalWealth,
        count: counts[s.type],
        notes: s.note,
        noteKey: s.noteKey,
        hasRadd: (s as any).hasRadd
    })).filter(s => s.shareValue > 0);
};
