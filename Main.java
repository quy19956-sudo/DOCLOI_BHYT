package vn.bd.raloixml;
import android.app.Activity;
import android.content.Intent;
import android.content.ClipData;
import android.os.Bundle;
import android.net.Uri;
import android.webkit.*;
import android.graphics.Color;
import android.view.WindowManager;
import java.util.ArrayList;
public class Main extends Activity {
  private ValueCallback<Uri[]> pending;
  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
    getWindow().setStatusBarColor(Color.rgb(15,62,63));
    WebView web=new WebView(this);
    web.getSettings().setJavaScriptEnabled(true);
    web.getSettings().setAllowContentAccess(true);
    web.getSettings().setAllowFileAccess(false);
    web.setWebViewClient(new WebViewClient(){
      @Override public boolean shouldOverrideUrlLoading(WebView w, WebResourceRequest req){return true;}
    });
    web.setWebChromeClient(new WebChromeClient(){
      @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){
        if(pending!=null)pending.onReceiveValue(null);
        pending=callback;
        Intent pick=new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*");
        pick.putExtra(Intent.EXTRA_ALLOW_MULTIPLE,true);
        try {startActivityForResult(pick,41);} catch(android.content.ActivityNotFoundException e){pending=null;callback.onReceiveValue(null);}
        return true;
      }
    });
    setContentView(web);
    web.loadUrl("file:///android_asset/index.html");
  }
  @Override protected void onActivityResult(int req,int code,Intent data){
    super.onActivityResult(req,code,data);
    if(req!=41||pending==null)return;
    ArrayList<Uri> picked=new ArrayList<>();
    if(code==RESULT_OK&&data!=null){
      ClipData clip=data.getClipData();
      if(clip!=null){for(int i=0;i<clip.getItemCount();i++){Uri u=clip.getItemAt(i).getUri();if(u!=null)picked.add(u);}}
      else if(data.getData()!=null)picked.add(data.getData());
    }
    pending.onReceiveValue(picked.isEmpty()?null:picked.toArray(new Uri[0]));
    pending=null;
  }
}
