package com.android.example.mobile

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.android.example.mobile.R
import com.android.example.mobile.databinding.FragmentHomeBinding
import com.google.android.material.bottomnavigation.BottomNavigationView


class Home : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        val view = binding.root
        view.findViewById<BottomNavigationView>(R.id.bottom_navigation).setOnItemSelectedListener { item ->
            when(item.itemId) {
                R.id.home_page -> {
                    // Respond to navigation item 1 click
                    true
                }
                R.id.camera_page -> {
                    // Respond to navigation item 2 click
                    findNavController().navigate(R.id.home_to_camera)
                    false
                }
                else -> false
            }
        }
        return view
    }


}