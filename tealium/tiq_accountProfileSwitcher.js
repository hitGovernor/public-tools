// Switch TiQ Account & Profile
utui.profile.getRevision({
  account: 'ACCOUNT-NAME', // change to desired account
  profile: 'PROFILE-NAME', // change to desired profile
  revision: 'latestversion' // leave as-is
}, function () {
  console.log(`### Successfully switched account/profile!`);
});