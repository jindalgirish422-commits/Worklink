import { Worker, JobRequest, WorkerEligibility, HardConstraintCheck } from '../../types';
import { isValidCoordinates, isDistanceWithinServiceZone } from '../locationService';

/**
 * WORKLINK MATCHING ENGINE: STAGE 1 — HARD ELIGIBILITY FILTER
 *
 * Removes workers who fail non-negotiable criteria before any soft scoring or ranking.
 * Non-negotiable criteria:
 * 1. Verification (identity and background verification)
 * 2. Required Skills (must possess all mandatory skills requested for the job)
 * 3. Availability (must be ready within requested urgency window)
 * 4. 10 km Service Radius (strict 10.0 km geographic cutoff from customer coordinates)
 * 5. Mandatory Requirements (minimum trade experience and constraints)
 */
export function checkWorkerEligibility(
  worker: Worker,
  job: JobRequest
): WorkerEligibility {
  const checks: HardConstraintCheck[] = [
    // 1. Verification Filter
    {
      ruleName: 'Worker Verified',
      passed: Boolean(worker.isVerified && worker.backgroundCheckPassed !== false),
      detail:
        worker.isVerified && worker.backgroundCheckPassed !== false
          ? `Govt ID & background check verified (${worker.licenseNumber || 'Verified ID'})`
          : 'Worker has unverified identity or incomplete background vetting',
    },

    // 2. Required Skill Filter
    {
      ruleName: 'Required Skills Available',
      passed: (() => {
        if (!job.requiredSkills || job.requiredSkills.length === 0) return true;
        // Every required skill must be present in worker's skill set (case-insensitive substring or word match)
        return job.requiredSkills.every((req) => {
          const reqLower = req.toLowerCase().trim();
          return worker.skills.some((ws) => {
            const wsLower = ws.toLowerCase().trim();
            return wsLower.includes(reqLower) || reqLower.includes(wsLower);
          });
        });
      })(),
      detail: (() => {
        if (!job.requiredSkills || job.requiredSkills.length === 0) {
          return 'No explicit mandatory skills required for general trade request';
        }
        const matched = worker.skills.filter((ws) =>
          job.requiredSkills.some((req) => {
            const reqLower = req.toLowerCase().trim();
            const wsLower = ws.toLowerCase().trim();
            return wsLower.includes(reqLower) || reqLower.includes(wsLower);
          })
        );
        return `Holds ${matched.length} of ${job.requiredSkills.length} required skills (${worker.skills.slice(0, 3).join(', ')})`;
      })(),
    },

    // 3. Availability Filter
    {
      ruleName: 'Available at Requested Time',
      passed: (() => {
        if (job.urgency === 'emergency') {
          return worker.availabilityStatus === 'immediate';
        }
        if (job.urgency === 'high') {
          return worker.availabilityStatus === 'immediate' || worker.availabilityStatus === 'today';
        }
        return worker.availabilityStatus !== 'busy';
      })(),
      detail:
        worker.availabilityStatus === 'immediate'
          ? 'Available immediately (<45m arrival)'
          : worker.availabilityStatus === 'today'
          ? `Available today (${worker.nextAvailableSlot})`
          : worker.availabilityStatus === 'tomorrow'
          ? `Available tomorrow (${worker.nextAvailableSlot})`
          : 'Worker is currently busy or unavailable',
    },

    // 4. 10 km Radius Filter
    {
      ruleName: 'Within 10 km Service Zone',
      passed:
        isValidCoordinates(worker.coordinates) &&
        isDistanceWithinServiceZone(worker.distanceKm, 10.0),
      detail: !isValidCoordinates(worker.coordinates)
        ? 'Worker GPS coordinates missing or invalid'
        : isDistanceWithinServiceZone(worker.distanceKm, 10.0)
        ? `${worker.distanceKm.toFixed(1)} km from customer (within 10.0 km boundary)`
        : `${worker.distanceKm.toFixed(1)} km away (exceeds 10.0 km boundary)`,
    },

    // 5. Mandatory Experience & Requirements Filter
    {
      ruleName: 'Mandatory Experience & Requirements',
      passed: (() => {
        const minExp = job.requiredExperienceYears || 1;
        if (worker.experienceYears < minExp) return false;

        // Check explicit mandatory conditions if provided
        if (job.mandatoryConditions && job.mandatoryConditions.length > 0) {
          const conditionsMet = job.mandatoryConditions.every((cond) => {
            const condLower = cond.toLowerCase();
            if (condLower.includes('license') || condLower.includes('certified')) {
              return Boolean(worker.licenseNumber);
            }
            if (condLower.includes('verified')) {
              return worker.isVerified;
            }
            return true;
          });
          if (!conditionsMet) return false;
        }

        return true;
      })(),
      detail:
        worker.experienceYears >= (job.requiredExperienceYears || 1)
          ? `${worker.experienceYears} yrs experience (meets ${job.requiredExperienceYears || 1}+ yrs requirement)`
          : `${worker.experienceYears} yrs experience (below ${job.requiredExperienceYears || 1}+ yrs requirement)`,
    },
  ];

  const failedCheck = checks.find((c) => !c.passed);
  return {
    workerId: worker.id,
    worker,
    isEligible: !failedCheck,
    failedRule: failedCheck?.ruleName,
    checks,
  };
}
