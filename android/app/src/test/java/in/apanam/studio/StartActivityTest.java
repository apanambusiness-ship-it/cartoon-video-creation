package in.apanam.studio;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.Robolectric;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import static org.junit.Assert.*;
@RunWith(RobolectricTestRunner.class)
@Config(sdk = 34)
public class StartActivityTest {
 public static class MissingBrowser extends StartActivity {
  @Override protected void launchBrowser(Intent intent) { throw new ActivityNotFoundException(); }
 }
 public static class BlockedBrowser extends StartActivity {
  @Override protected void launchBrowser(Intent intent) { throw new SecurityException(); }
 }
 public static class WorkingBrowser extends StartActivity {
  Intent opened;
  @Override protected void launchBrowser(Intent intent) { opened=intent; }
 }
 @Test public void missingBrowserKeepsVisibleScreenAndReason() {
  MissingBrowser a=Robolectric.buildActivity(MissingBrowser.class).setup().get();
  a.openStudio(false); assertFalse(a.isFinishing()); assertTrue(a.status.getText().toString().contains("browser नहीं मिला"));
 }
 @Test public void blockedBrowserShowsReasonInsteadOfClosing() {
  BlockedBrowser a=Robolectric.buildActivity(BlockedBrowser.class).setup().get();
  a.openStudio(true); assertFalse(a.isFinishing()); assertTrue(a.status.getText().toString().contains("अनुमति नहीं"));
 }
 @Test public void bothButtonsOpenOnlyTheStudioUrl() {
  WorkingBrowser a=Robolectric.buildActivity(WorkingBrowser.class).setup().get();
  for(boolean plain:new boolean[]{false,true}) { a.openStudio(plain); assertEquals(StartActivity.STUDIO,a.opened.getData().toString()); assertEquals(Intent.ACTION_VIEW,a.opened.getAction()); }
 }
}
