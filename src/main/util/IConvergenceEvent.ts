/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

/**
 * The IConvergenceEvent is the parent interface of all events fired by
 * Convergence. It ensures that each fired event has a name property that
 * indicates the event that was fired.
 */
export interface IConvergenceEvent {

  /**
   * The name of the event that was fired. This is commonly used to filter when
   * using the [[ConvergenceEventEmitter.events]] stream.
   *
   * Note that the name is only guaranteed to be unique within the class /
   * subsystem that is firing it. Names might be reused across classes and
   * subsystems.
   */
  name: string;
}
