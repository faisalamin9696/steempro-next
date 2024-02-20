export class Role {
  static LEVELS = ['muted', 'guest', 'member', 'mod', 'admin', 'owner'];

  static level = (role: string): number => {
    role = role || 'guest';
    const level = Role.LEVELS.indexOf(role);
  
    if (level === -1) {
      throw new Error('Invalid role: ' + role);
    }
  
    return level;
  };
  static atLeast = (
    role: string,
    target: 'muted' |'guest' | 'member' | 'mod' | 'admin' | 'owner',
  ): boolean => {
    const roleLevel = Role.level(role || 'guest');
    const targetLevel = Role.level(target);
    return roleLevel >= targetLevel;
  };

  static canPost = (name, role) => {
    // sds role fixed
    role = role || 'guest';
    if (!name) return true;
    // journal/council restriction: only members can post
    const minRole = Role.parseType(name) == 1 ? 'guest' : 'member';
    return Role.atLeast(role, minRole);
  };

  static canComment = (name, role) => {
    // sds role fixed
    role = role || 'guest';
    if (!name) return true;
    // council restriction: only members can comment
    const minRole = Role.parseType(name) == 3 ? 'member' : 'guest';
    return Role.atLeast(role, minRole);
  };

  static parseType = name => {
    return parseInt(name[5]);
  };
}
