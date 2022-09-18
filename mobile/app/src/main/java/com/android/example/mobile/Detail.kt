package com.android.example.mobile

import android.os.Bundle
import android.text.method.ScrollingMovementMethod
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.android.example.mobile.databinding.ActivityDetailBinding
import com.android.volley.DefaultRetryPolicy
import com.android.volley.Request
import com.android.volley.Response
import com.android.volley.toolbox.StringRequest
import com.android.volley.toolbox.Volley
import org.json.JSONObject
import pl.droidsonroids.gif.GifImageView


class Detail : AppCompatActivity() {

    private lateinit var viewBinding: ActivityDetailBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewBinding = ActivityDetailBinding.inflate(layoutInflater)
        setContentView(viewBinding.root)

        val extras = intent.extras
        if (extras != null) {
            val value = extras.getString("name")
            val info = extras.getString("info")
            viewBinding.title.text = value
            viewBinding.content.movementMethod = ScrollingMovementMethod()
            viewBinding.content.text = info
        }
    }

    private fun getInfo(name: String?, longitude: String?, latitude: String?) {
        val queue = Volley.newRequestQueue(applicationContext)
        val url = "http://10.0.2.2:5000/info"
        val stringRequest = object : StringRequest(
            Request.Method.POST, url, Response.Listener { response ->
                viewBinding.content.text = response
                viewBinding.content.visibility = TextView.VISIBLE
            },
            Response.ErrorListener {
                    error -> Toast.makeText(applicationContext, "An error occurred", Toast.LENGTH_SHORT).show()
            }) {
            override fun getBodyContentType(): String {
                return "application/json"
            }
            override fun getBody(): ByteArray {
                val params = mutableMapOf<String, String>()
                params["name"] = name.toString()
                params["longitude"] = longitude.toString()
                params["latitude"] = latitude.toString()
                return JSONObject(params as Map<*, *>).toString().toByteArray()
            }
        }
        stringRequest.retryPolicy = DefaultRetryPolicy(
            30000,
            DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
            DefaultRetryPolicy.DEFAULT_BACKOFF_MULT
        )
        queue.add(stringRequest)
    }

}