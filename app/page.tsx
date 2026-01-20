import Link from 'next/link'
import { Activity, Trophy, Users, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-red-600">🏋️ PushUp Challenge</h1>
          <div className="flex gap-4">
            <Link href="/login" className="btn btn-secondary">
              Log In
            </Link>
            <Link href="/signup" className="btn btn-primary">
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          Build Strength Together
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Track your push-ups, compete in challenges, and build lasting habits 
          with friends. Turn fitness into a game.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="btn btn-primary text-lg px-8 py-3">
            Get Started Free
          </Link>
          <Link href="/login" className="btn btn-secondary text-lg px-8 py-3">
            Learn More
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card text-center">
            <Activity className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Track Daily Progress</h3>
            <p className="text-gray-600">
              Log your push-ups and watch your streak grow. Visualize your progress with charts and calendars.
            </p>
          </div>

          <div className="card text-center">
            <Trophy className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Compete in Challenges</h3>
            <p className="text-gray-600">
              Join weekly and monthly challenges. Climb the leaderboard and prove your dedication.
            </p>
          </div>

          <div className="card text-center">
            <Users className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connect with Friends</h3>
            <p className="text-gray-600">
              Add friends, compare stats, and send friendly trash-talk to keep each other motivated.
            </p>
          </div>

          <div className="card text-center">
            <TrendingUp className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Earn Badges & Streaks</h3>
            <p className="text-gray-600">
              Unlock achievements, maintain streaks, and celebrate milestones. Gamify your fitness journey.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="text-gray-600 mb-8">
          Join thousands building strength one push-up at a time.
        </p>
        <Link href="/signup" className="btn btn-primary text-lg px-8 py-3">
          Sign Up Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 PushUp Challenge. Built with 💪</p>
        </div>
      </footer>
    </div>
  )
}

