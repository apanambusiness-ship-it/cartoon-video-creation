package in.apanam.studio;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebChromeClient;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.Robolectric;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;
import java.util.ArrayList;
import java.util.List;
import static org.junit.Assert.*;
import static org.robolectric.Shadows.shadowOf;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = 34)
public class StartActivityTest {
 private WebChromeClient.FileChooserParams picker() {
  return new WebChromeClient.FileChooserParams() {
   public int getMode() { return MODE_OPEN; }
   public String[] getAcceptTypes() { return new String[]{"image/*"}; }
   public boolean isCaptureEnabled() { return false; }
   public CharSequence getTitle() { return "Photo"; }
   public String getFilenameHint() { return null; }
   public Intent createIntent() { return new Intent(Intent.ACTION_GET_CONTENT).setType("image/*"); }
  };
 }
 @Test public void opensAndroidPickerAndDeliversImage() {
  StartActivity a = Robolectric.buildActivity(StartActivity.class).setup().get();
  List<Uri[]> results = new ArrayList<>();
  assertTrue(a.chooseFiles(results::add, picker()));
  Intent intent = shadowOf(a).getNextStartedActivityForResult().intent;
  assertEquals(Intent.ACTION_GET_CONTENT, intent.getAction());
  assertEquals("image/*", intent.getType());
  assertTrue(intent.hasCategory(Intent.CATEGORY_OPENABLE));
  Uri photo = Uri.parse("content://media/external/images/media/42");
  a.onActivityResult(StartActivity.PICK_FILE, Activity.RESULT_OK, new Intent().setData(photo));
  assertEquals(1, results.size());
  assertArrayEquals(new Uri[]{photo}, results.get(0));
  a.onActivityResult(StartActivity.PICK_FILE, Activity.RESULT_OK, new Intent().setData(photo));
  assertEquals(1, results.size());
 }
 @Test public void cancelAndReopenDoNotLeaveAnUnresolvedCallback() {
  StartActivity a = Robolectric.buildActivity(StartActivity.class).setup().get();
  List<Uri[]> first = new ArrayList<>(), second = new ArrayList<>();
  a.chooseFiles(first::add, picker());
  a.chooseFiles(second::add, picker());
  assertEquals(1, first.size()); assertNull(first.get(0));
  a.onActivityResult(StartActivity.PICK_FILE, Activity.RESULT_CANCELED, null);
  assertEquals(1, second.size()); assertNull(second.get(0));
 }
 @Test public void activityDestructionCancelsThePendingPicker() {
  org.robolectric.android.controller.ActivityController<StartActivity> controller = Robolectric.buildActivity(StartActivity.class).setup();
  List<Uri[]> results = new ArrayList<>();
  controller.get().chooseFiles(results::add, picker());
  controller.pause().stop().destroy();
  assertEquals(1, results.size()); assertNull(results.get(0));
 }
 @Test public void studioUrlIsHttps() { assertTrue(BuildConfig.STUDIO_URL.startsWith("https://")); }
}
