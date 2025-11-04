export default {
  common: {
    appName: 'Enterprise App',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    refresh: 'Refresh',
    download: 'Download',
    upload: 'Upload'
  },
  auth: {
    login: 'Login',
    logout: 'Logout',
    username: 'Username',
    password: 'Password',
    email: 'Email',
    rememberMe: 'Remember Me',
    forgotPassword: 'Forgot Password?',
    loginSuccess: 'Login successful',
    loginError: 'Login failed',
    invalidCredentials: 'Invalid username or password',
    mfaRequired: 'MFA verification required',
    mfaCode: 'Verification Code',
    mfaCodeSent: 'Verification code sent to your email',
    mfaVerify: 'Verify',
    mfaResend: 'Resend Code',
    sessionExpired: 'Session expired. Please login again.',
    ssoLogin: 'SSO Login'
  },
  menu: {
    dashboard: 'Dashboard',
    userManagement: 'User Management',
    reports: 'Reports',
    settings: 'Settings',
    favorites: 'Favorites',
    recent: 'Recent',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites'
  },
  footer: {
    currentProgram: 'Current Program',
    version: 'Version',
    copyright: '© 2024 Enterprise App. All rights reserved.'
  },
  grid: {
    noRows: 'No data available',
    rowsPerPage: 'Rows per page',
    of: 'of',
    exportExcel: 'Export to Excel',
    importExcel: 'Import from Excel'
  },
  file: {
    upload: 'Upload File',
    download: 'Download File',
    uploadSuccess: 'File uploaded successfully',
    uploadError: 'File upload failed',
    dragDrop: 'Drag and drop files here, or click to select',
    maxSize: 'Max file size',
    allowedTypes: 'Allowed file types'
  },
  editor: {
    placeholder: 'Start typing...',
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strike: 'Strikethrough',
    link: 'Link',
    image: 'Image',
    table: 'Table',
    bulletList: 'Bullet List',
    orderedList: 'Ordered List',
    undo: 'Undo',
    redo: 'Redo'
  },
  autoLogout: {
    title: 'Session Timeout Warning',
    message: 'Your session will expire in {seconds} seconds due to inactivity.',
    stayLoggedIn: 'Stay Logged In',
    logoutNow: 'Logout Now'
  }
} as const;
