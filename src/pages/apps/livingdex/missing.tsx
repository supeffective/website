import MissingPokemonView from '@/features/livingdex/views/MissingPokemonView'
import LivingDexLayout from '@/lib/components/layout/LivingDexLayout'

const Page = () => {
  return (
    <LivingDexLayout>
      <MissingPokemonView />
    </LivingDexLayout>
  )
}

export default Page
