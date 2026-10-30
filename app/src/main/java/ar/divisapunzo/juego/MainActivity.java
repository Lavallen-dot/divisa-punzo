package ar.divisapunzo.juego;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);                 // guarda el récord
        s.setMediaPlaybackRequiresUserGesture(false); // sonido
        s.setAllowFileAccess(true);

        web.setBackgroundColor(0xFF140806);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setHapticFeedbackEnabled(false);
        web.setLongClickable(false);
        web.setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View v) { return true; }
        });
        web.setWebViewClient(new WebViewClient());
        web.loadUrl("file:///android_asset/www/index.html");
    }

    private void immersive() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) immersive();
    }

    @Override
    protected void onPause() {
        super.onPause();
        // pausa el juego al salir de la app
        web.evaluateJavascript("(function(){var g=window.DP&&DP.Game;if(g&&g.state==='play')g.state='pause';})()", null);
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    public void onBackPressed() {
        // 1er "atrás": pausa; estando en pausa/menú: sale
        web.evaluateJavascript(
            "(function(){var g=DP.Game;if(g.state==='play'){g.state='pause';return 'p';}return 'x';})()",
            new android.webkit.ValueCallback<String>() {
                @Override
                public void onReceiveValue(String v) {
                    if (v == null || !v.contains("p")) finish();
                }
            });
    }
}
