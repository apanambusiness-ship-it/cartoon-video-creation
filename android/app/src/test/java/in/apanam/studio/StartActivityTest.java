package in.apanam.studio;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.Robolectric;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;

import static org.junit.Assert.*;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = 34)
public class StartActivityTest {
 @Test public void createsEmbeddedStudioWebView() {
  StartActivity a = Robolectric.buildActivity(StartActivity.class).setup().get();
  assertFalse(a.isFinishing());
  assertNotNull(a.findViewById(android.R.id.content));
 }
 @Test public void studioUrlIsHttps() {
  assertTrue(BuildConfig.STUDIO_URL.startsWith("https://"));
 }
}
